import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart data." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 5 MB." }, { status: 400 });
  }

  // Ensure bucket exists — idempotent, ignore "already exists" error
  await supabase.storage.createBucket("resumes", {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });

  const path = `${user.id}/${Date.now()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(path, buffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("resumes")
    .getPublicUrl(uploadData.path);

  // Save to profile so it pre-fills on future applications
  await supabase.from("profiles").update({ resume_url: publicUrl }).eq("id", user.id);

  return NextResponse.json({ url: publicUrl });
}
