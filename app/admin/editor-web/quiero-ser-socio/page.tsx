"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import styles from "./quiero-socio-editor.module.css";

type PreviewMode = "desktop" | "mobile";

type PlatformItem = {
  id: string;
  name: string;
  color: string;
  cssClass: string;
  enabled: boolean;
};

type TextItem = {
  id: string;
  text: string;
};

type BenefitCard = {
  id: string;
  kicker: string;
  title: string;
  text: string;
  buttonText: string;
  buttonHref: string;
  variant: "red" | "cyan";
};

type ReceiveBenefit = {
  id: string;
  title: string;
  text: string;
};

type AffiliateStep = {
  id: string;
  number: string;
  text: string;
};

type SocioDraft = {
  brandName: string;
  brandSubtitle: string;
  sideBrandText: string;
  showSideBrand: boolean;

  navInicioText: string;
  navInicioHref: string;
  navPricesText: string;
  navPricesHref: string;
  navSocioText: string;
  navSocioHref: string;

  whatsappNumber: string;
  whatsappMessage: string;

  heroBadge: string;
  heroTitleOne: string;
  heroTitleTwo: string;
  heroTitleThree: string;
  heroHighlight: string;
  heroDescription: string;
  heroPrimaryText: string;
  heroPrimaryHref: string;
  heroSecondaryText: string;
  heroSecondaryHref: string;

  promoEnabled: boolean;
  promoBadge: string;
  promoTitle: string;
  promoPricePen: string;
  promoOldPricePen: string;
  usdRate: string;
  promoCountdownLabel: string;
  promoBenefits: TextItem[];
  promoPrimaryText: string;
  promoSecondaryText: string;

  platformsTitle: string;
  platformsKicker: string;
  platforms: PlatformItem[];

  profitKicker: string;
  profitTitle: string;
  profitLead: string;
  profitLabel: string;
  profitAmount: string;
  profitExampleText: string;
  profitSteps: TextItem[];

  accessKicker: string;
  accessTitle: string;
  benefitCards: BenefitCard[];

  receiveKicker: string;
  receiveTitle: string;
  receiveBenefits: ReceiveBenefit[];

  affiliateKicker: string;
  affiliateTitle: string;
  affiliateText: string;
  affiliateSteps: AffiliateStep[];
  affiliateChips: TextItem[];

  pricingKicker: string;
  pricingTitle: string;
  pricingPricePen: string;
  pricingOldPricePen: string;
  pricingBulletsLeft: TextItem[];
  pricingBulletsRight: TextItem[];
  pricingPricesButtonText: string;
  pricingPricesButtonHref: string;
  pricingAccessButtonText: string;

  footerText: string;
  termsText: string;
  privacyText: string;

  primaryColor: string;
  glowColor: string;
  panelColor: string;
};

const platformDefaults: PlatformItem[] = [
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
];

const factoryDraft: SocioDraft = {
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
  platforms: platformDefaults,

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

const groups = [
  "Marca",
  "Hero",
  "Promoción",
  "Plataformas",
  "Rentabilidad",
  "Ventajas",
  "Beneficios",
  "Afiliación",
  "Cómo ser socio",
  "Footer",
  "Colores",
] as const;

type EditorGroup = (typeof groups)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeTextItems(base: TextItem[], incoming: unknown): TextItem[] {
  if (!Array.isArray(incoming)) {
    return base;
  }

  return base.map((item, index) => {
    const incomingItem = incoming[index];
    if (!isRecord(incomingItem)) {
      return item;
    }

    return {
      ...item,
      ...incomingItem,
      id: typeof incomingItem.id === "string" ? incomingItem.id : item.id,
      text: typeof incomingItem.text === "string" ? incomingItem.text : item.text,
    };
  });
}

function normalizeDraft(content: unknown): SocioDraft {
  if (!isRecord(content)) {
    return factoryDraft;
  }

  const incomingPlatforms: unknown[] = Array.isArray(content.platforms)
    ? content.platforms
    : [];
  const incomingBenefitCards: unknown[] = Array.isArray(content.benefitCards)
    ? content.benefitCards
    : [];
  const incomingReceiveBenefits: unknown[] = Array.isArray(content.receiveBenefits)
    ? content.receiveBenefits
    : [];
  const incomingAffiliateSteps: unknown[] = Array.isArray(content.affiliateSteps)
    ? content.affiliateSteps
    : [];

  return {
    ...factoryDraft,
    ...content,
    promoBenefits: mergeTextItems(factoryDraft.promoBenefits, content.promoBenefits),
    profitSteps: mergeTextItems(factoryDraft.profitSteps, content.profitSteps),
    affiliateChips: mergeTextItems(factoryDraft.affiliateChips, content.affiliateChips),
    pricingBulletsLeft: mergeTextItems(factoryDraft.pricingBulletsLeft, content.pricingBulletsLeft),
    pricingBulletsRight: mergeTextItems(factoryDraft.pricingBulletsRight, content.pricingBulletsRight),
    platforms: factoryDraft.platforms.map((item, index) => {
      const incoming = incomingPlatforms[index];
      if (!isRecord(incoming)) {
        return item;
      }

      return {
        ...item,
        ...incoming,
        id: typeof incoming.id === "string" ? incoming.id : item.id,
        name: typeof incoming.name === "string" ? incoming.name : item.name,
        color: typeof incoming.color === "string" ? incoming.color : item.color,
        cssClass: item.cssClass,
        enabled: typeof incoming.enabled === "boolean" ? incoming.enabled : item.enabled,
      };
    }),
    benefitCards: factoryDraft.benefitCards.map((item, index) => {
      const incoming = incomingBenefitCards[index];
      if (!isRecord(incoming)) {
        return item;
      }

      return {
        ...item,
        ...incoming,
        id: item.id,
        variant: item.variant,
      };
    }),
    receiveBenefits: factoryDraft.receiveBenefits.map((item, index) => {
      const incoming = incomingReceiveBenefits[index];
      if (!isRecord(incoming)) {
        return item;
      }

      return {
        ...item,
        ...incoming,
        id: item.id,
      };
    }),
    affiliateSteps: factoryDraft.affiliateSteps.map((item, index) => {
      const incoming = incomingAffiliateSteps[index];
      if (!isRecord(incoming)) {
        return item;
      }

      return {
        ...item,
        ...incoming,
        id: item.id,
      };
    }),
  };
}

function priceUsd(pricePen: string, rate: string) {
  const pen = Number(pricePen);
  const usdRate = Number(rate);

  if (!Number.isFinite(pen) || !Number.isFinite(usdRate) || usdRate <= 0) {
    return "0.00";
  }

  return (pen / usdRate).toFixed(2);
}

function buildWhatsappLink(number: string, message: string) {
  const cleanNumber = number.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export default function QuieroSerSocioEditorPage() {
  const [draft, setDraft] = useState<SocioDraft>(factoryDraft);
  const [activeGroup, setActiveGroup] = useState<EditorGroup>("Marca");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const previewStyle = useMemo(
    () =>
      ({
        "--preview-primary": draft.primaryColor,
        "--preview-glow": draft.glowColor,
        "--preview-panel": draft.panelColor,
      }) as CSSProperties,
    [draft.primaryColor, draft.glowColor, draft.panelColor]
  );

  const currentUsd = useMemo(
    () => priceUsd(draft.pricingPricePen, draft.usdRate),
    [draft.pricingPricePen, draft.usdRate]
  );

  const promoUsd = useMemo(
    () => priceUsd(draft.promoPricePen, draft.usdRate),
    [draft.promoPricePen, draft.usdRate]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      try {
        const response = await fetch("/api/editor-web/quiero-ser-socio", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar Quiero ser socio.");
        }

        const data = (await response.json()) as {
          draftContent?: unknown;
          publishedContent?: unknown;
        };

        if (!cancelled) {
          setDraft(normalizeDraft(data.draftContent || data.publishedContent));
        }
      } catch (error) {
        console.error(error);
        toast.error("No se pudo cargar el editor de socios.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateDraft<K extends keyof SocioDraft>(key: K, value: SocioDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateTextItem(
    listKey:
      | "promoBenefits"
      | "profitSteps"
      | "affiliateChips"
      | "pricingBulletsLeft"
      | "pricingBulletsRight",
    index: number,
    value: string
  ) {
    setDraft((current) => ({
      ...current,
      [listKey]: current[listKey].map((item, itemIndex) =>
        itemIndex === index ? { ...item, text: value } : item
      ),
    }));
  }

  function updatePlatform(index: number, patch: Partial<PlatformItem>) {
    setDraft((current) => ({
      ...current,
      platforms: current.platforms.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function updateBenefitCard(index: number, patch: Partial<BenefitCard>) {
    setDraft((current) => ({
      ...current,
      benefitCards: current.benefitCards.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function updateReceiveBenefit(index: number, patch: Partial<ReceiveBenefit>) {
    setDraft((current) => ({
      ...current,
      receiveBenefits: current.receiveBenefits.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function updateAffiliateStep(index: number, patch: Partial<AffiliateStep>) {
    setDraft((current) => ({
      ...current,
      affiliateSteps: current.affiliateSteps.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  async function saveContent(action: "save-draft" | "publish" | "restore") {
    const isPublish = action === "publish";
    const isRestore = action === "restore";

    if (isPublish) {
      setIsPublishing(true);
    } else {
      setIsSaving(true);
    }

    try {
      const response = await fetch("/api/editor-web/quiero-ser-socio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRestore
            ? { action }
            : {
                action,
                content: draft,
              }
        ),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        content?: unknown;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo procesar la solicitud.");
      }

      if (isRestore) {
        setDraft(normalizeDraft(data?.content));
        toast.success("Se restauró el contenido publicado.");
        return;
      }

      toast.success(isPublish ? "Quiero ser socio publicado." : "Borrador guardado.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  }

  function restoreFactory() {
    const confirmed = window.confirm(
      "¿Restablecer el editor con el contenido de fábrica? No se publicará hasta que presiones Publicar."
    );

    if (!confirmed) {
      return;
    }

    setDraft(factoryDraft);
    toast.success("Contenido de fábrica cargado como borrador local.");
  }

  const currentWhatsappLink = buildWhatsappLink(draft.whatsappNumber, draft.whatsappMessage);

  return (
    <main className={styles.editorShell}>
      <span className={styles.editorSideBrand}>{draft.sideBrandText}</span>
      <span className={`${styles.editorSideBrand} ${styles.editorSideBrandRight}`}>
        {draft.sideBrandText}
      </span>

      <div className={styles.mobileStickyHeader}>
        <section className={styles.editorTopbar}>
          <div className={styles.editorBrandBlock}>
            <h1>Editar Quiero Ser Socio</h1>
            <p className={styles.editorBrandSubtitle}>EDITOR WEB / SOCIOS</p>
          </div>

          <div className={styles.topbarActions}>
            <Link href="/admin/editor-web" className={styles.secondaryButton}>
              Volver
            </Link>
            <button
              type="button"
              className={`${styles.secondaryButton} ${styles.factoryButton}`}
              onClick={restoreFactory}
              disabled={isSaving || isPublishing}
            >
              Restablecer fábrica
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => saveContent("restore")}
              disabled={isSaving || isPublishing}
            >
              Restaurar publicado
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => saveContent("save-draft")}
              disabled={isLoading || isSaving || isPublishing}
            >
              {isSaving ? "Guardando..." : "Guardar borrador"}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => saveContent("publish")}
              disabled={isLoading || isSaving || isPublishing}
            >
              {isPublishing ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </section>

        <nav className={`${styles.groupTabs} ${styles.mobileGroupTabs}`} aria-label="Secciones del editor">
          {groups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setActiveGroup(group)}
              className={activeGroup === group ? styles.activeTab : ""}
            >
              {group}
            </button>
          ))}
        </nav>
      </div>

      <section className={styles.workspace}>
        <aside className={styles.editorPanel}>
          <nav className={`${styles.groupTabs} ${styles.desktopGroupTabs}`} aria-label="Secciones del editor">
            {groups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setActiveGroup(group)}
                className={activeGroup === group ? styles.activeTab : ""}
              >
                {group}
              </button>
            ))}
          </nav>

          <div className={styles.formCard}>
            {isLoading ? (
              <div className={styles.helpBox}>Cargando contenido del editor...</div>
            ) : (
              <>
                {activeGroup === "Marca" && (
                  <>
                    <Field label="Nombre de marca" value={draft.brandName} onChange={(value) => updateDraft("brandName", value)} />
                    <Field label="Subtítulo de marca" value={draft.brandSubtitle} onChange={(value) => updateDraft("brandSubtitle", value)} />
                    <Field label="Texto lateral" value={draft.sideBrandText} onChange={(value) => updateDraft("sideBrandText", value)} />
                    <ToggleField
                      label="Mostrar marca lateral"
                      enabled={draft.showSideBrand}
                      onChange={(value) => updateDraft("showSideBrand", value)}
                    />
                    <Field label="Número WhatsApp" value={draft.whatsappNumber} onChange={(value) => updateDraft("whatsappNumber", value)} />
                    <Field
                      label="Mensaje WhatsApp"
                      value={draft.whatsappMessage}
                      onChange={(value) => updateDraft("whatsappMessage", value)}
                      multiline
                    />
                  </>
                )}

                {activeGroup === "Hero" && (
                  <>
                    <Field label="Texto botón Inicio" value={draft.navInicioText} onChange={(value) => updateDraft("navInicioText", value)} />
                    <Field label="URL botón Inicio" value={draft.navInicioHref} onChange={(value) => updateDraft("navInicioHref", value)} />
                    <Field label="Texto botón precios" value={draft.navPricesText} onChange={(value) => updateDraft("navPricesText", value)} />
                    <Field label="URL botón precios" value={draft.navPricesHref} onChange={(value) => updateDraft("navPricesHref", value)} />
                    <Field label="Texto botón socio superior" value={draft.navSocioText} onChange={(value) => updateDraft("navSocioText", value)} />
                    <Field label="URL botón socio superior" value={draft.navSocioHref} onChange={(value) => updateDraft("navSocioHref", value)} />
                    <Field label="Etiqueta hero" value={draft.heroBadge} onChange={(value) => updateDraft("heroBadge", value)} />
                    <Field label="Título línea 1" value={draft.heroTitleOne} onChange={(value) => updateDraft("heroTitleOne", value)} />
                    <Field label="Título línea 2" value={draft.heroTitleTwo} onChange={(value) => updateDraft("heroTitleTwo", value)} />
                    <Field label="Título línea 3" value={draft.heroTitleThree} onChange={(value) => updateDraft("heroTitleThree", value)} />
                    <Field label="Texto resaltado cyan" value={draft.heroHighlight} onChange={(value) => updateDraft("heroHighlight", value)} />
                    <Field label="Descripción" value={draft.heroDescription} onChange={(value) => updateDraft("heroDescription", value)} multiline />
                    <Field label="Botón principal" value={draft.heroPrimaryText} onChange={(value) => updateDraft("heroPrimaryText", value)} />
                    <Field label="URL botón principal" value={draft.heroPrimaryHref} onChange={(value) => updateDraft("heroPrimaryHref", value)} />
                    <Field label="Botón secundario" value={draft.heroSecondaryText} onChange={(value) => updateDraft("heroSecondaryText", value)} />
                    <Field label="URL botón secundario" value={draft.heroSecondaryHref} onChange={(value) => updateDraft("heroSecondaryHref", value)} />
                  </>
                )}

                {activeGroup === "Promoción" && (
                  <>
                    <ToggleField
                      label="Mostrar modal promoción"
                      enabled={draft.promoEnabled}
                      onChange={(value) => updateDraft("promoEnabled", value)}
                    />
                    <Field label="Etiqueta promoción" value={draft.promoBadge} onChange={(value) => updateDraft("promoBadge", value)} />
                    <Field label="Título promoción" value={draft.promoTitle} onChange={(value) => updateDraft("promoTitle", value)} />
                    <Field label="Precio promoción S/" value={draft.promoPricePen} onChange={(value) => updateDraft("promoPricePen", value)} />
                    <Field label="Precio anterior S/" value={draft.promoOldPricePen} onChange={(value) => updateDraft("promoOldPricePen", value)} />
                    <Field label="Tipo de cambio USD" value={draft.usdRate} onChange={(value) => updateDraft("usdRate", value)} />
                    <div className={styles.helpBox}>
                      Vista actual: <strong>S/{draft.promoPricePen}</strong> equivale a <strong>USD {promoUsd}</strong>. En la web se mostrará como <strong>1 USD = S/ {draft.usdRate}</strong>.
                    </div>
                    <Field label="Texto contador" value={draft.promoCountdownLabel} onChange={(value) => updateDraft("promoCountdownLabel", value)} />
                    {draft.promoBenefits.map((item, index) => (
                      <Field
                        key={item.id}
                        label={`Punto promoción ${index + 1}`}
                        value={item.text}
                        onChange={(value) => updateTextItem("promoBenefits", index, value)}
                        multiline
                      />
                    ))}
                    <Field label="Botón principal modal" value={draft.promoPrimaryText} onChange={(value) => updateDraft("promoPrimaryText", value)} />
                    <Field label="Botón secundario modal" value={draft.promoSecondaryText} onChange={(value) => updateDraft("promoSecondaryText", value)} />
                  </>
                )}

                {activeGroup === "Plataformas" && (
                  <>
                    <Field label="Etiqueta sección" value={draft.platformsKicker} onChange={(value) => updateDraft("platformsKicker", value)} />
                    <Field label="Título sección" value={draft.platformsTitle} onChange={(value) => updateDraft("platformsTitle", value)} multiline />
                    <div className={styles.helpBox}>
                      Cada plataforma conserva su brillo por marca. Puedes cambiar nombre, color y ocultarla.
                    </div>
                    {draft.platforms.map((platform, index) => (
                      <div key={platform.id} className={styles.inlineEditorCard}>
                        <strong>{index + 1}. {platform.name}</strong>
                        <Field label="Nombre" value={platform.name} onChange={(value) => updatePlatform(index, { name: value })} />
                        <ColorField label="Color" value={platform.color} onChange={(value) => updatePlatform(index, { color: value })} />
                        <ToggleField label="Mostrar" enabled={platform.enabled} onChange={(value) => updatePlatform(index, { enabled: value })} />
                      </div>
                    ))}
                  </>
                )}

                {activeGroup === "Rentabilidad" && (
                  <>
                    <Field label="Etiqueta sección" value={draft.profitKicker} onChange={(value) => updateDraft("profitKicker", value)} />
                    <Field label="Título sección" value={draft.profitTitle} onChange={(value) => updateDraft("profitTitle", value)} />
                    <Field label="Texto introductorio" value={draft.profitLead} onChange={(value) => updateDraft("profitLead", value)} multiline />
                    <Field label="Etiqueta ganancia" value={draft.profitLabel} onChange={(value) => updateDraft("profitLabel", value)} />
                    <Field label="Monto ganancia" value={draft.profitAmount} onChange={(value) => updateDraft("profitAmount", value)} />
                    <Field label="Texto ejemplo" value={draft.profitExampleText} onChange={(value) => updateDraft("profitExampleText", value)} />
                    {draft.profitSteps.map((item, index) => (
                      <Field
                        key={item.id}
                        label={`Paso rentabilidad ${index + 1}`}
                        value={item.text}
                        onChange={(value) => updateTextItem("profitSteps", index, value)}
                        multiline
                      />
                    ))}
                  </>
                )}

                {activeGroup === "Ventajas" && (
                  <>
                    <Field label="Etiqueta sección" value={draft.accessKicker} onChange={(value) => updateDraft("accessKicker", value)} />
                    <Field label="Título sección" value={draft.accessTitle} onChange={(value) => updateDraft("accessTitle", value)} multiline />
                    {draft.benefitCards.map((card, index) => (
                      <div key={card.id} className={styles.inlineEditorCard}>
                        <strong>{card.variant === "red" ? "Primer beneficio" : "Segundo beneficio"}</strong>
                        <Field label="Etiqueta" value={card.kicker} onChange={(value) => updateBenefitCard(index, { kicker: value })} />
                        <Field label="Título" value={card.title} onChange={(value) => updateBenefitCard(index, { title: value })} />
                        <Field label="Texto" value={card.text} onChange={(value) => updateBenefitCard(index, { text: value })} multiline />
                        <Field label="Texto botón" value={card.buttonText} onChange={(value) => updateBenefitCard(index, { buttonText: value })} />
                        <Field label="URL botón" value={card.buttonHref} onChange={(value) => updateBenefitCard(index, { buttonHref: value })} />
                      </div>
                    ))}
                  </>
                )}

                {activeGroup === "Beneficios" && (
                  <>
                    <Field label="Etiqueta sección" value={draft.receiveKicker} onChange={(value) => updateDraft("receiveKicker", value)} />
                    <Field label="Título sección" value={draft.receiveTitle} onChange={(value) => updateDraft("receiveTitle", value)} />
                    {draft.receiveBenefits.map((benefit, index) => (
                      <div key={benefit.id} className={styles.inlineEditorCard}>
                        <strong>Beneficio {index + 1}</strong>
                        <Field label="Título" value={benefit.title} onChange={(value) => updateReceiveBenefit(index, { title: value })} />
                        <Field label="Texto" value={benefit.text} onChange={(value) => updateReceiveBenefit(index, { text: value })} multiline />
                      </div>
                    ))}
                  </>
                )}

                {activeGroup === "Afiliación" && (
                  <>
                    <Field label="Etiqueta sección" value={draft.affiliateKicker} onChange={(value) => updateDraft("affiliateKicker", value)} />
                    <Field label="Título sección" value={draft.affiliateTitle} onChange={(value) => updateDraft("affiliateTitle", value)} multiline />
                    <Field label="Texto principal" value={draft.affiliateText} onChange={(value) => updateDraft("affiliateText", value)} multiline />
                    {draft.affiliateSteps.map((step, index) => (
                      <div key={step.id} className={styles.inlineEditorCard}>
                        <strong>Paso afiliación {index + 1}</strong>
                        <Field label="Número" value={step.number} onChange={(value) => updateAffiliateStep(index, { number: value })} />
                        <Field label="Texto" value={step.text} onChange={(value) => updateAffiliateStep(index, { text: value })} multiline />
                      </div>
                    ))}
                    {draft.affiliateChips.map((item, index) => (
                      <Field
                        key={item.id}
                        label={`Chip ${index + 1}`}
                        value={item.text}
                        onChange={(value) => updateTextItem("affiliateChips", index, value)}
                      />
                    ))}
                  </>
                )}

                {activeGroup === "Cómo ser socio" && (
                  <>
                    <Field label="Etiqueta sección" value={draft.pricingKicker} onChange={(value) => updateDraft("pricingKicker", value)} />
                    <Field label="Título sección" value={draft.pricingTitle} onChange={(value) => updateDraft("pricingTitle", value)} />
                    <Field label="Precio S/" value={draft.pricingPricePen} onChange={(value) => updateDraft("pricingPricePen", value)} />
                    <Field label="Precio anterior S/" value={draft.pricingOldPricePen} onChange={(value) => updateDraft("pricingOldPricePen", value)} />
                    <Field label="Tipo de cambio USD" value={draft.usdRate} onChange={(value) => updateDraft("usdRate", value)} />
                    <div className={styles.helpBox}>
                      Vista actual: <strong>S/{draft.pricingPricePen}</strong> equivale a <strong>USD {currentUsd}</strong>. Para cambiar el dólar después, entra a este mismo campo.
                    </div>
                    {draft.pricingBulletsLeft.map((item, index) => (
                      <Field
                        key={item.id}
                        label={`Punto izquierdo ${index + 1}`}
                        value={item.text}
                        onChange={(value) => updateTextItem("pricingBulletsLeft", index, value)}
                      />
                    ))}
                    {draft.pricingBulletsRight.map((item, index) => (
                      <Field
                        key={item.id}
                        label={`Punto derecho ${index + 1}`}
                        value={item.text}
                        onChange={(value) => updateTextItem("pricingBulletsRight", index, value)}
                      />
                    ))}
                    <Field label="Botón precios" value={draft.pricingPricesButtonText} onChange={(value) => updateDraft("pricingPricesButtonText", value)} />
                    <Field label="URL botón precios" value={draft.pricingPricesButtonHref} onChange={(value) => updateDraft("pricingPricesButtonHref", value)} />
                    <Field label="Botón acceso" value={draft.pricingAccessButtonText} onChange={(value) => updateDraft("pricingAccessButtonText", value)} />
                  </>
                )}

                {activeGroup === "Footer" && (
                  <>
                    <Field label="Texto footer" value={draft.footerText} onChange={(value) => updateDraft("footerText", value)} />
                    <Field label="Texto términos" value={draft.termsText} onChange={(value) => updateDraft("termsText", value)} />
                    <Field label="Texto privacidad" value={draft.privacyText} onChange={(value) => updateDraft("privacyText", value)} />
                  </>
                )}

                {activeGroup === "Colores" && (
                  <>
                    <ColorField label="Cyan principal" value={draft.primaryColor} onChange={(value) => updateDraft("primaryColor", value)} />
                    <ColorField label="Cyan glow" value={draft.glowColor} onChange={(value) => updateDraft("glowColor", value)} />
                    <Field label="Color panel glass" value={draft.panelColor} onChange={(value) => updateDraft("panelColor", value)} />
                  </>
                )}
              </>
            )}
          </div>

          <div className={styles.saveBar}>
            <button type="button" className={styles.secondaryButton} onClick={restoreFactory} disabled={isSaving || isPublishing}>
              Restablecer fábrica
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => saveContent("restore")} disabled={isSaving || isPublishing}>
              Restaurar publicado
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => saveContent("save-draft")} disabled={isLoading || isSaving || isPublishing}>
              Guardar borrador
            </button>
            <button type="button" className={styles.primaryButton} onClick={() => saveContent("publish")} disabled={isLoading || isSaving || isPublishing}>
              Publicar
            </button>
          </div>
        </aside>

        <section className={styles.previewPanel}>
          <div className={styles.previewToolbar}>
            <div>
              <p className={styles.kicker}>Vista previa</p>
              <h2>Quiero ser socio</h2>
            </div>

            <div className={styles.previewSwitch}>
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={previewMode === "desktop" ? styles.activePreview : ""}
              >
                PC
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={previewMode === "mobile" ? styles.activePreview : ""}
              >
                Celular
              </button>
            </div>
          </div>

          <div className={styles.previewFrameOuter}>
            <div
              className={`${styles.previewSite} ${previewMode === "mobile" ? styles.previewMobile : ""}`}
              style={previewStyle}
            >
              {draft.showSideBrand && (
                <>
                  <span className={styles.previewSideBrand}>{draft.sideBrandText}</span>
                  <span className={`${styles.previewSideBrand} ${styles.previewSideBrandRight}`}>
                    {draft.sideBrandText}
                  </span>
                </>
              )}

              <header className={styles.previewTopbar}>
                <div>
                  <strong>{draft.brandName}</strong>
                  <span>{draft.brandSubtitle}</span>
                </div>
                <nav className={styles.previewNav}>
                  <span>{draft.navInicioText}</span>
                  <span className={styles.previewNavPrimary}>{draft.navPricesText}</span>
                  <span className={styles.previewNavSocio}>{draft.navSocioText}</span>
                </nav>
              </header>

              <section className={styles.previewHero}>
                <span className={styles.previewBadge}>{draft.heroBadge}</span>
                <h3>
                  {draft.heroTitleOne}
                  <br />
                  {draft.heroTitleTwo}
                  <br />
                  {draft.heroTitleThree} <b>{draft.heroHighlight}</b>
                </h3>
                <p>{draft.heroDescription}</p>
                <div className={styles.previewHeroButtons}>
                  <span>{draft.heroPrimaryText}</span>
                  <span>{draft.heroSecondaryText}</span>
                </div>
              </section>

              <section className={styles.previewSection}>
                <span className={styles.previewBadge}>{draft.platformsKicker}</span>
                <h4>{draft.platformsTitle}</h4>
                <div className={styles.previewPlatforms}>
                  {draft.platforms
                    .filter((platform) => platform.enabled)
                    .map((platform) => {
                      const platformClass = styles[platform.cssClass as keyof typeof styles] || "";
                      return (
                        <span
                          key={platform.id}
                          className={`${styles.previewPlatformCard} ${platformClass}`}
                          style={{ "--app-rgb-color": platform.color } as CSSProperties}
                        >
                          {platform.name}
                        </span>
                      );
                    })}
                </div>
              </section>

              <section className={styles.previewSection}>
                <span className={styles.previewBadge}>{draft.profitKicker}</span>
                <h4>{draft.profitTitle}</h4>
                <div className={styles.previewProfitGrid}>
                  <article className={styles.previewProfitCard}>
                    <p>{draft.profitLead}</p>
                    <div className={styles.previewProfitAmount}>
                      <small>{draft.profitLabel}</small>
                      <strong>{draft.profitAmount}</strong>
                      <span>{draft.profitExampleText}</span>
                    </div>
                  </article>
                  <article className={styles.previewStepList}>
                    {draft.profitSteps.map((step, index) => (
                      <div key={step.id}>
                        <span>{index + 1}</span>
                        <p>{step.text}</p>
                      </div>
                    ))}
                  </article>
                </div>
              </section>

              <section className={styles.previewSection}>
                <span className={styles.previewBadge}>{draft.accessKicker}</span>
                <h4>{draft.accessTitle}</h4>
                <div className={styles.previewBenefitPair}>
                  {draft.benefitCards.map((card) => (
                    <article
                      key={card.id}
                      className={`${styles.previewBenefitCard} ${
                        card.variant === "red" ? styles.previewRedCard : styles.previewCyanCard
                      }`}
                    >
                      <small>{card.kicker}</small>
                      <h5>{card.title}</h5>
                      <p>{card.text}</p>
                      <span>{card.buttonText}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.previewSection}>
                <span className={styles.previewBadge}>{draft.receiveKicker}</span>
                <h4>{draft.receiveTitle}</h4>
                <div className={styles.previewReceiveGrid}>
                  {draft.receiveBenefits.map((benefit, index) => (
                    <article key={benefit.id}>
                      <small>{String(index + 1).padStart(2, "0")}</small>
                      <h5>{benefit.title}</h5>
                      <p>{benefit.text}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.previewSection}>
                <span className={styles.previewBadge}>{draft.affiliateKicker}</span>
                <h4>{draft.affiliateTitle}</h4>
                <p className={styles.previewCenterText}>{draft.affiliateText}</p>
                <div className={styles.previewAffiliateSteps}>
                  {draft.affiliateSteps.map((step) => (
                    <article key={step.id}>
                      <strong>{step.number}</strong>
                      <p>{step.text}</p>
                    </article>
                  ))}
                </div>
                <div className={styles.previewAffiliateChips}>
                  {draft.affiliateChips.map((chip) => (
                    <span key={chip.id}>✅ {chip.text}</span>
                  ))}
                </div>
              </section>

              <section className={styles.previewSection}>
                <span className={styles.previewBadge}>{draft.pricingKicker}</span>
                <h4>{draft.pricingTitle}</h4>
                <div className={styles.previewPricingBox}>
                  <strong>S/ {draft.pricingPricePen}</strong>
                  <b>USD {currentUsd}</b>
                  <small>Antes: S/ {draft.pricingOldPricePen}</small>
                  <em>1 USD = S/ {draft.usdRate}</em>
                </div>
                <div className={styles.previewPricingList}>
                  <div>
                    {draft.pricingBulletsLeft.map((item) => (
                      <span key={item.id}>✅ {item.text}</span>
                    ))}
                  </div>
                  <div>
                    {draft.pricingBulletsRight.map((item) => (
                      <span key={item.id}>✅ {item.text}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.previewHeroButtons}>
                  <span>{draft.pricingPricesButtonText}</span>
                  <span>{draft.pricingAccessButtonText}</span>
                </div>
              </section>

              <footer className={styles.previewFooter}>
                <p>{draft.footerText}</p>
                <span>{draft.termsText}</span>
                <span>•</span>
                <span>{draft.privacyText}</span>
              </footer>

              <a className={styles.hiddenWhatsapp} href={currentWhatsappLink}>
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.colorInputRow}>
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function ToggleField({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className={styles.toggleField}>
      <span>{label}</span>
      <button
        type="button"
        className={enabled ? styles.toggleOn : ""}
        onClick={() => onChange(!enabled)}
      >
        {enabled ? "Activo" : "Oculto"}
      </button>
    </div>
  );
}
