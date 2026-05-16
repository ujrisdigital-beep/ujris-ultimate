import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const skey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase       = createClient(url, key);
export const supabaseAdmin  = createClient(url, skey);

export const BUCKET = "ujris-evidence";

export async function uploadChunked(
  file: File,
  path: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const CHUNK = 5 * 1024 * 1024; // 5 MB chunks
  const chunks = Math.ceil(file.size / CHUNK);

  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK;
    const blob  = file.slice(start, start + CHUNK);
    const chunkPath = chunks === 1 ? path : `${path}.part${i}`;

    const { error } = await supabase.storage.from(BUCKET).upload(chunkPath, blob, {
      upsert: true,
      contentType: file.type,
    });
    if (error) throw error;
    onProgress?.((i + 1) / chunks * 100);
  }

  if (chunks > 1) {
    // For single-chunk files return directly; multi-chunk handled server-side
    return path;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
