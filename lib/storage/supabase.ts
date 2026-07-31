const BUCKET = "cms-media";

function getSupabaseUrl(): string {
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL.replace(/\/$/, "");
  return "https://ufwghleouumwlbrtdtqk.supabase.co";
}

function getServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmd2dobGVvdXVtd2xicnRkdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzI2NTkzNSwiZXhwIjoyMDk4ODQxOTM1fQ.6P8D5rnKSnP_lYUDwmNCq6RfP8wU1gBl6ocwdJusg8Q";
  return key;
}

let bucketReady = false;

/** Creates the public bucket once per server lifetime; 409 (already exists) is fine. */
async function ensureBucket(baseUrl: string, key: string) {
  if (bucketReady) return;
  const res = await fetch(`${baseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text();
    // Supabase also reports duplicates as 400 "already exists".
    if (!text.includes("already exists")) {
      throw new Error(`Failed to create storage bucket: ${res.status} ${text}`);
    }
  }
  bucketReady = true;
}

/** Uploads an image buffer to Supabase Storage and returns its public URL. */
export async function uploadImage(data: ArrayBuffer, contentType: string, extension: string): Promise<string> {
  const baseUrl = getSupabaseUrl();
  const key = getServiceKey();
  await ensureBucket(baseUrl, key);

  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const res = await fetch(`${baseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: data,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image upload failed: ${res.status} ${text}`);
  }

  return `${baseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}
