import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "ujris-evidence";

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _supabase;
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }
  return _supabaseAdmin;
}

// Convenience aliases used in client code
export const supabase      = { storage: { from: (b: string) => getSupabase().storage.from(b) } };
export const supabaseAdmin = { storage: { from: (b: string) => getSupabaseAdmin().storage.from(b) } };

export async function deleteFile(path: string) {
  const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadChunked(
  file: File,
  path: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const CHUNK = 5 * 1024 * 1024;
  const chunks = Math.ceil(file.size / CHUNK);
  const client = getSupabase();

  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK;
    const blob  = file.slice(start, start + CHUNK);
    const chunkPath = chunks === 1 ? path : `${path}.part${i}`;

    const { error } = await client.storage.from(BUCKET).upload(chunkPath, blob, {
      upsert: true,
      contentType: file.type,
    });
    if (error) throw error;
    onProgress?.((i + 1) / chunks * 100);
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
