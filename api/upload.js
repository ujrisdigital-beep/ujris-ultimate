import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const contentType = req.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) return res.status(400).json({ error: 'No boundary in multipart request' });

    const parts = parseMultipart(buffer, boundary);
    const filePart = parts.find(p => p.filename);
    const metaPart = parts.find(p => p.name === 'meta');

    if (!filePart) return res.status(400).json({ error: 'No file found in request' });

    const meta = metaPart ? JSON.parse(metaPart.data.toString()) : {};
    const { caseId = 'aldi', title, description, documentDate, exhibitRef, isKey = false } = meta;

    const filename = `${caseId}/${Date.now()}_${filePart.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const { error: uploadError } = await supabase.storage
      .from('ujris_evidence')
      .upload(filename, filePart.data, {
        contentType: filePart.contentType,
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ error: `Upload failed: ${uploadError.message}` });
    }

    const { data: evidenceRecord, error: dbError } = await supabase
      .from('my_evidence')
      .insert({
        case_id: caseId,
        title: title || filePart.filename,
        description,
        document_date: documentDate || null,
        exhibit_ref: exhibitRef || null,
        storage_path: filename,
        file_type: filePart.contentType,
        is_key: isKey,
      })
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({ error: `DB error: ${dbError.message}` });
    }

    const { data: urlData } = await supabase.storage
      .from('ujris_evidence')
      .createSignedUrl(filename, 3600);

    return res.status(200).json({
      success: true,
      evidence: evidenceRecord,
      signedUrl: urlData?.signedUrl,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuf = Buffer.from(`--${boundary}`);
  let start = 0;

  while (start < buffer.length) {
    const boundaryIndex = buffer.indexOf(boundaryBuf, start);
    if (boundaryIndex === -1) break;
    const headerStart = boundaryIndex + boundaryBuf.length + 2;
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), headerStart);
    if (headerEnd === -1) break;

    const headerStr = buffer.slice(headerStart, headerEnd).toString();
    const dataStart = headerEnd + 4;
    const nextBoundary = buffer.indexOf(boundaryBuf, dataStart);
    const dataEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2;

    const headers = {};
    headerStr.split('\r\n').forEach(line => {
      const [k, ...vs] = line.split(': ');
      if (k) headers[k.toLowerCase()] = vs.join(': ');
    });

    const cd = headers['content-disposition'] || '';
    const nameMatch = cd.match(/name="([^"]+)"/);
    const filenameMatch = cd.match(/filename="([^"]+)"/);

    parts.push({
      name: nameMatch?.[1] || '',
      filename: filenameMatch?.[1] || '',
      contentType: headers['content-type'] || 'application/octet-stream',
      data: buffer.slice(dataStart, dataEnd),
    });

    start = nextBoundary === -1 ? buffer.length : nextBoundary;
  }

  return parts;
}
