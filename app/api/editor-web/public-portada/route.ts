import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const PAGE_SLUG = "portada";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("web_pages")
      .select("published_content,published_at")
      .eq("slug", PAGE_SLUG)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      content: data?.published_content || {},
      publishedAt: data?.published_at || null,
    });
  } catch (error) {
    console.error("GET /api/editor-web/public-portada", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo cargar la portada publicada." },
      { status: 500 }
    );
  }
}
