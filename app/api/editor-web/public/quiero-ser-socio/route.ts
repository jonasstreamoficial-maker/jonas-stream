import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const PAGE_SLUG = "quiero-ser-socio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("web_pages")
      .select("published_content,published_at,updated_at")
      .eq("slug", PAGE_SLUG)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const content = data?.published_content || {};

    return NextResponse.json(
      {
        ok: true,
        content,
        publishedContent: content,
        publishedAt: data?.published_at || null,
        updatedAt: data?.updated_at || null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/editor-web/public/quiero-ser-socio", error);

    return NextResponse.json(
      { error: "No se pudo cargar el contenido publicado." },
      { status: 500 }
    );
  }
}