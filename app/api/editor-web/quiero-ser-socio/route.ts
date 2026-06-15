import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const PAGE_SLUG = "quiero-ser-socio";

export const runtime = "nodejs";

const defaultContent = {
  brandName: "JONAS STREAM",
  brandSubtitle: "PLATAFORMA OFICIAL",
  sideBrandText: "JONAS STREAM",
  showSideBrand: true,

  navInicioText: "INICIO",
  navInicioHref: "/",
  navPricesText: "VER PRECIOS",
  navPricesHref: "/ver-precios",
  navSocioText: "QUIERO SER SOCIO",
  navSocioHref: "/quiero-ser-socio",

  whatsappNumber: "51900557949",
  whatsappMessage: "Hola Jonas Stream, quiero ser socio y aprovechar la promoción.",

  heroBadge: "NEGOCIO PARA REVENDEDORES",
  heroTitleOne: "CONVIÉRTETE EN SOCIO",
  heroTitleTwo: "Y EMPIEZA A REVENDER",
  heroTitleThree: "CON",
  heroHighlight: "JONAS STREAM",
  heroDescription:
    "¿Te gustaría generar ingresos vendiendo las plataformas más buscadas del mercado? Soy JONAS, administrador y proveedor autorizado. Te acompañaré paso a paso para que empieces sin complicaciones y veas resultados rápido.",
  heroPrimaryText: "QUIERO SER SOCIO",
  heroPrimaryHref: "#como-ser-socio",
  heroSecondaryText: "VER PRECIOS",
  heroSecondaryHref: "/ver-precios",

  promoEnabled: true,
  promoBadge: "PROMOCIÓN EXCLUSIVA",
  promoTitle: "PROMOCIÓN EXCLUSIVA HOY",
  promoPricePen: "10.00",
  promoOldPricePen: "80.00",
  usdRate: "3.75",
  promoCountdownLabel: "Tiempo restante para que termine el día",
  promoBenefits: [
    { id: "promo-1", text: "Ingresas al grupo privado de socios revendedores." },
    { id: "promo-2", text: "Recibes orientación para entender la dinámica del negocio." },
    { id: "promo-3", text: "Empiezas a ofrecer plataformas premium con mejor imagen." },
    { id: "promo-4", text: "Generas ganancias revendiendo con apoyo y respaldo." },
  ],
  promoPrimaryText: "QUIERO APROVECHAR LA PROMO",
  promoSecondaryText: "CERRAR Y SEGUIR VIENDO",

  platformsKicker: "PLATAFORMAS DISPONIBLES",
  platformsTitle: "LO QUE PUEDES OFRECER DESDE EL INICIO",
  platforms: [
    { id: "netflix", name: "Netflix", color: "#e50914", cssClass: "netflix", enabled: true },
    { id: "disney", name: "Disney+", color: "#00b2bb", cssClass: "disney", enabled: true },
    { id: "prime", name: "Prime Video", color: "#007aff", cssClass: "prime", enabled: true },
    { id: "max", name: "Max", color: "#0027ef", cssClass: "max", enabled: true },
    { id: "paramount", name: "Paramount+", color: "#0068ff", cssClass: "paramount", enabled: true },
    { id: "crunchy", name: "Crunchyroll", color: "#ff5800", cssClass: "crunchy", enabled: true },
    { id: "vix", name: "VIX", color: "#ff5800", cssClass: "vix", enabled: true },
    { id: "iptv", name: "IPTV", color: "#5440eb", cssClass: "iptv", enabled: true },
    { id: "viki", name: "Viki", color: "#009dff", cssClass: "viki", enabled: true },
    { id: "more", name: "y más", color: "#00fbff", cssClass: "more", enabled: true },
  ],

  profitKicker: "CÓMO GANAS DINERO",
  profitTitle: "EJEMPLO SENCILLO DE RENTABILIDAD",
  profitLead: "Así funciona el negocio: compras al por mayor y vendes por perfil con buena ganancia.",
  profitLabel: "GANANCIA NETA ESTIMADA",
  profitAmount: "S/38.00",
  profitExampleText: "Ejemplo con Prime Video",
  profitSteps: [
    { id: "profit-1", text: "Compras una cuenta completa de Prime Video por S/10.00 (incluye 6 perfiles)." },
    { id: "profit-2", text: "Vendes cada perfil a S/8.00." },
    { id: "profit-3", text: "Total vendido: S/48.00." },
    { id: "profit-4", text: "Restando tu inversión de S/10.00, obtienes una ganancia neta de S/38.00." },
  ],

  accessKicker: "BENEFICIOS POR EL DÍA DE HOY",
  accessTitle: "ACCESOS Y VENTAJAS ACTIVAS PARA EMPEZAR HOY",
  benefitCards: [
    {
      id: "benefit-red",
      kicker: "PRIMER BENEFICIO",
      title: "Comunidad Pública Exclusiva",
      text: "Únete gratis a nuestra comunidad pública exclusiva de NETFLIX para empezar a conectar con el entorno del negocio.",
      buttonText: "IR AL GRUPO OFICIAL",
      buttonHref: "#",
      variant: "red",
    },
    {
      id: "benefit-cyan",
      kicker: "SEGUNDO BENEFICIO",
      title: "Catálogo VIP",
      text: "Accede a un catálogo VIP con excelentes precios, actualizado constantemente, para revender y tener un buen margen de ganancia.",
      buttonText: "VER PRECIOS VIP",
      buttonHref: "/ver-precios",
      variant: "cyan",
    },
  ],

  receiveKicker: "BENEFICIOS",
  receiveTitle: "LO QUE RECIBES AL ENTRAR",
  receiveBenefits: [
    {
      id: "receive-1",
      title: "Comunidad privada",
      text: "Forma parte del grupo exclusivo de socios revendedores para recibir soporte, guía, novedades y acompañamiento real del negocio.",
    },
    {
      id: "receive-2",
      title: "Catálogo exclusivo",
      text: "Accede a precios rebajados, promociones especiales y mejores condiciones que el público general para revender con margen.",
    },
    {
      id: "receive-3",
      title: "Publicidad editable",
      text: "Obtén material visual editable para publicar más profesional, captar clientes y vender con una mejor imagen.",
    },
    {
      id: "receive-4",
      title: "Ganancias por reventa",
      text: "Compras a precio socio y revendes por perfil o cuenta para generar ingresos con buena rentabilidad desde el primer día.",
    },
    {
      id: "receive-5",
      title: "Soporte y orientación",
      text: "No empiezas solo. Recibes acompañamiento para entender cómo funciona la compra, venta, activación y atención al cliente.",
    },
    {
      id: "receive-6",
      title: "Afiliación de socios",
      text: "También puedes recomendar el acceso a otras personas y ganar afiliando nuevos socios a la comunidad.",
    },
  ],

  affiliateKicker: "AFILIACIÓN ADICIONAL",
  affiliateTitle: "ADEMÁS DE VENDER, TAMBIÉN PODRÁS AFILIAR",
  affiliateText:
    "Recomiendas la comunidad a un amigo o familiar y tú decides cuánto cobrarle por inscripción. Puede ser S/10, S/20 o S/30.",
  affiliateSteps: [
    { id: "affiliate-1", number: "01", text: "Nosotros solo cobramos S/5 por activar al nuevo socio." },
    { id: "affiliate-2", number: "02", text: "El nuevo socio recibe los mismos beneficios principales que tú." },
    { id: "affiliate-3", number: "03", text: "Ganas vendiendo plataformas y también recomendando nuevos socios." },
  ],
  affiliateChips: [
    { id: "chip-1", text: "Catálogo exclusivo" },
    { id: "chip-2", text: "Promociones activas" },
    { id: "chip-3", text: "Comunidad privada" },
    { id: "chip-4", text: "Material publicitario" },
  ],

  pricingKicker: "CÓMO SER SOCIO",
  pricingTitle: "INGRESA HOY CON PROMOCIÓN ACTIVA",
  pricingPricePen: "10.00",
  pricingOldPricePen: "80.00",
  pricingBulletsLeft: [
    { id: "price-left-1", text: "Catálogo VIP con precios rebajados." },
    { id: "price-left-2", text: "Promociones más accesibles que al público general." },
    { id: "price-left-3", text: "Comunidad privada de socios." },
  ],
  pricingBulletsRight: [
    { id: "price-right-1", text: "Plantilla de Excel Premium para el control de ventas profesional." },
    { id: "price-right-2", text: "Publicidad editable en Canva PRO." },
    { id: "price-right-3", text: "Oportunidad de generar ingresos desde casa." },
  ],
  pricingPricesButtonText: "VER PRECIOS VIP",
  pricingPricesButtonHref: "/ver-precios",
  pricingAccessButtonText: "ACTIVAR MI ACCESO",

  footerText: "© 2026 Jonas Stream. Todos los derechos reservados.",
  termsText: "Términos y Condiciones",
  privacyText: "Política de Privacidad",

  primaryColor: "#01E7EF",
  glowColor: "#00FBFF",
  panelColor: "rgba(3, 19, 22, 0.78)",
};

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
          draft_content: defaultContent,
          published_content: defaultContent,
          published_at: new Date().toISOString(),
        })
        .select("slug,draft_content,published_content,updated_at,published_at")
        .single();

      if (insertError) {
        throw insertError;
      }

      return NextResponse.json({
        slug: inserted.slug,
        draftContent: inserted.draft_content,
        publishedContent: inserted.published_content,
        updatedAt: inserted.updated_at,
        publishedAt: inserted.published_at,
      });
    }

    return NextResponse.json({
      slug: data.slug,
      draftContent: data.draft_content,
      publishedContent: data.published_content,
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

      const restoredContent = data?.published_content || defaultContent;

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

      return NextResponse.json({ ok: true, content: restoredContent });
    }

    if (!body.content || typeof body.content !== "object" || Array.isArray(body.content)) {
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

      return NextResponse.json({ ok: true, publishedAt: now });
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
