import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const BUCKET_NAME = "site-assets";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ninguna imagen." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa JPG, PNG, WEBP o SVG." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "La imagen no debe pesar más de 5 MB." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const extension = safeName.includes(".") ? safeName.split(".").pop() : "webp";
    const filePath = `editor-web/portada/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, Buffer.from(arrayBuffer), {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return NextResponse.json({
      ok: true,
      path: filePath,
      url: data.publicUrl,
    });
  } catch (error) {
    console.error("POST /api/editor-web/upload", error);
    return NextResponse.json(
      { error: "No se pudo subir la imagen." },
      { status: 500 }
    );
  }
}
