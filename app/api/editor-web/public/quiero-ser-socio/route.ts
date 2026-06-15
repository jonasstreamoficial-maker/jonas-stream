import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const PAGE_SLUG = "quiero-ser-socio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("web_pages")
      .select("slug,published_content,updated_at,published_at")
      .eq("slug", PAGE_SLUG)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        ok: true,
        slug: data?.slug || PAGE_SLUG,
        content: data?.published_content || {},
        updatedAt: data?.updated_at || null,
        publishedAt: data?.published_at || null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/editor-web/public/quiero-ser-socio", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo cargar Quiero ser socio publicado." },
      { status: 500 }
    );
  }
}
