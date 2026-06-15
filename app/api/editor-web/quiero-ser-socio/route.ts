import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const PAGE_SLUG = "quiero-ser-socio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("web_pages")
      .select("slug,draft_content,published_content,updated_at,published_at")
      .eq("slug", PAGE_SLUG)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from("web_pages")
        .insert({
          slug: PAGE_SLUG,
          draft_content: {},
          published_content: {},
          published_at: new Date().toISOString(),
        })
        .select("slug,draft_content,published_content,updated_at,published_at")
        .single();

      if (insertError) {
        throw insertError;
      }

      return NextResponse.json({
        slug: inserted.slug,
        draftContent: inserted.draft_content || {},
        publishedContent: inserted.published_content || {},
        updatedAt: inserted.updated_at,
        publishedAt: inserted.published_at,
      });
    }

    return NextResponse.json({
      slug: data.slug,
      draftContent: data.draft_content || {},
      publishedContent: data.published_content || {},
      updatedAt: data.updated_at,
      publishedAt: data.published_at,
    });
  } catch (error) {
    console.error("GET /api/editor-web/quiero-ser-socio", error);

    return NextResponse.json(
      { error: "No se pudo cargar Quiero ser socio." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      action?: "save-draft" | "publish" | "restore";
      content?: unknown;
    } | null;

    if (!body?.action) {
      return NextResponse.json(
        { error: "Acción no válida." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    if (body.action === "restore") {
      const { data, error } = await supabase
        .from("web_pages")
        .select("published_content")
        .eq("slug", PAGE_SLUG)
        .single();

      if (error) {
        throw error;
      }

      const restoredContent = data?.published_content || {};

      const { error: updateError } = await supabase
        .from("web_pages")
        .update({
          draft_content: restoredContent,
          updated_at: now,
        })
        .eq("slug", PAGE_SLUG);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        ok: true,
        content: restoredContent,
      });
    }

    if (
      !body.content ||
      typeof body.content !== "object" ||
      Array.isArray(body.content)
    ) {
      return NextResponse.json(
        { error: "Contenido no válido." },
        { status: 400 }
      );
    }

    if (body.action === "save-draft") {
      const { error } = await supabase
        .from("web_pages")
        .update({
          draft_content: body.content,
          updated_at: now,
        })
        .eq("slug", PAGE_SLUG);

      if (error) {
        throw error;
      }

      return NextResponse.json({ ok: true });
    }

    if (body.action === "publish") {
      const { error } = await supabase
        .from("web_pages")
        .update({
          draft_content: body.content,
          published_content: body.content,
          updated_at: now,
          published_at: now,
        })
        .eq("slug", PAGE_SLUG);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        ok: true,
        publishedAt: now,
      });
    }

    return NextResponse.json(
      { error: "Acción no soportada." },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/editor-web/quiero-ser-socio", error);

    return NextResponse.json(
      { error: "No se pudo procesar Quiero ser socio." },
      { status: 500 }
    );
  }
}