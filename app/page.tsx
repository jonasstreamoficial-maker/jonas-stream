import HomeClient from "./home-client";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getPublishedPortadaContent(): Promise<unknown | null> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("web_pages")
      .select("published_content")
      .eq("slug", "portada")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.published_content ?? null;
  } catch (error) {
    console.error("No se pudo cargar la portada publicada", error);
    return null;
  }
}

export default async function Page() {
  const publishedContent = await getPublishedPortadaContent();

  return <HomeClient publishedContent={publishedContent} />;
}