import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

const BUCKET = "reportes-dw";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const filename = formData.get("filename");

    if (!(file instanceof Blob) || typeof filename !== "string" || !filename) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    const supabase = getSupabaseServiceClient();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(safeFilename, file, { contentType: "application/pdf" });

    if (error) {
      console.error("calculadora-dw-upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(safeFilename);

    return NextResponse.json({ ok: true, publicUrl });
  } catch (err) {
    console.error("calculadora-dw-upload error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
