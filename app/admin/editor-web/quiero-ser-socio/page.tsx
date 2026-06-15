"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import styles from "./quiero-socio-editor.module.css";

type PlatformItem = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  cssClass: string;
};

type TextItem = {
  id: string;
  text: string;
};

type NumberTextItem = TextItem & {
  number: string;
};

type ReceiveBenefit = {
  id: string;
  title: string;
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

type SocioDraft = {
  usdRate: string;
  brandName: string;
  brandSubtitle: string;
  sideBrandText: string;
  showSideBrand: boolean;
  primaryColor: string;
  glowColor: string;
  panelColor: string;
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
  platformsKicker: string;
  platformsTitle: string;
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
  affiliateSteps: NumberTextItem[];
  affiliateChips: TextItem[];
  pricingKicker: string;
  pricingTitle: string;
  pricingPricePen: string;
  pricingPriceUsd: string;
  pricingOldPricePen: string;
  pricingOldPriceUsd: string;
  pricingBulletsLeft: TextItem[];
  pricingBulletsRight: TextItem[];
  pricingAccessButtonText: string;
  pricingAccessButtonHref: string;
  pricingPricesButtonText: string;
  pricingPricesButtonHref: string;
  promoEnabled: boolean;
  promoBadge: string;
  promoTitle: string;
  promoPricePen: string;
  promoPriceUsd: string;
  promoOldPricePen: string;
  promoOldPriceUsd: string;
  promoCountdownLabel: string;
  promoBullets: TextItem[];
  promoPrimaryText: string;
  promoSecondaryText: string;
  footerText: string;
  termsText: string;
  privacyText: string;
};

type EditorGroup =
  | "Marca"
  | "Hero"
  | "Promoción"
  | "Plataformas"
  | "Rentabilidad"
  | "Ventajas"
  | "Beneficios"
  | "Afiliación"
  | "Cómo ser socio"
  | "Footer"
  | "Colores";

type PreviewMode = "desktop" | "mobile";

const groups: EditorGroup[] = [
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
];

const platformClassOptions = [
  "netflix",
  "disney",
  "prime",
  "max",
  "paramount",
  "crunchy",
  "vix",
  "iptv",
  "viki",
  "more",
];

const initialDraft: SocioDraft = {
  usdRate: "3.75",
  brandName: "JONAS STREAM",
  brandSubtitle: "PLATAFORMA OFICIAL",
  sideBrandText: "JONAS STREAM",
  showSideBrand: true,
  primaryColor: "#01E7EF",
  glowColor: "#00FBFF",
  panelColor: "rgba(3, 19, 22, 0.78)",
  navInicioText: "INICIO",
  navInicioHref: "/",
  navPricesText: "VER PRECIOS VIP",
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
  heroSecondaryText: "VER PRECIOS VIP",
  heroSecondaryHref: "/ver-precios",
  platformsKicker: "PLATAFORMAS DISPONIBLES",
  platformsTitle: "LO QUE PUEDES OFRECER DESDE EL INICIO",
  platforms: [
    { id: "netflix", name: "Netflix", color: "#e50914", enabled: true, cssClass: "netflix" },
    { id: "disney", name: "Disney+", color: "#00b2bb", enabled: true, cssClass: "disney" },
    { id: "prime", name: "Prime Video", color: "#007aff", enabled: true, cssClass: "prime" },
    { id: "max", name: "Max", color: "#0027ef", enabled: true, cssClass: "max" },
    { id: "paramount", name: "Paramount+", color: "#0068ff", enabled: true, cssClass: "paramount" },
    { id: "crunchy", name: "Crunchyroll", color: "#ff5800", enabled: true, cssClass: "crunchy" },
    { id: "vix", name: "VIX", color: "#ff5800", enabled: true, cssClass: "vix" },
    { id: "iptv", name: "IPTV", color: "#5440eb", enabled: true, cssClass: "iptv" },
    { id: "viki", name: "Viki", color: "#009dff", enabled: true, cssClass: "viki" },
    { id: "more", name: "y más", color: "#00fbff", enabled: true, cssClass: "more" },
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
    { id: "receive-1", title: "Comunidad privada", text: "Forma parte del grupo exclusivo de socios revendedores para recibir soporte, guía, novedades y acompañamiento real del negocio." },
    { id: "receive-2", title: "Catálogo exclusivo", text: "Accede a precios rebajados, promociones especiales y mejores condiciones que el público general para revender con margen." },
    { id: "receive-3", title: "Publicidad editable", text: "Obtén material visual editable para publicar más profesional, captar clientes y vender con una mejor imagen." },
    { id: "receive-4", title: "Ganancias por reventa", text: "Compras a precio socio y revendes por perfil o cuenta para generar ingresos con buena rentabilidad desde el primer día." },
    { id: "receive-5", title: "Soporte y orientación", text: "No empiezas solo. Recibes acompañamiento para entender cómo funciona la compra, venta, activación y atención al cliente." },
    { id: "receive-6", title: "Afiliación de socios", text: "También puedes recomendar el acceso a otras personas y ganar afiliando nuevos socios a la comunidad." },
  ],
  affiliateKicker: "AFILIACIÓN ADICIONAL",
  affiliateTitle: "ADEMÁS DE VENDER, TAMBIÉN PODRÁS AFILIAR",
  affiliateText: "Recomiendas la comunidad a un amigo o familiar y tú decides cuánto cobrarle por inscripción. Puede ser S/10, S/20 o S/30.",
  affiliateSteps: [
    { id: "affiliate-1", number: "01", text: "Nosotros solo cobramos S/5 por activar al nuevo socio." },
    { id: "affiliate-2", number: "02", text: "El nuevo socio recibe los mismos beneficios principales que tú." },
    { id: "affiliate-3", number: "03", text: "Ganas vendiendo plataformas y también recomendando nuevos socios." },
  ],
  affiliateChips: [
    { id: "chip-1", text: "✅ Catálogo exclusivo" },
    { id: "chip-2", text: "✅ Promociones activas" },
    { id: "chip-3", text: "✅ Comunidad privada" },
    { id: "chip-4", text: "✅ Material publicitario" },
  ],
  pricingKicker: "CÓMO SER SOCIO",
  pricingTitle: "INGRESA HOY CON PROMOCIÓN ACTIVA",
  pricingPricePen: "10.00",
  pricingPriceUsd: "2.67",
  pricingOldPricePen: "80.00",
  pricingOldPriceUsd: "21.33",
  pricingBulletsLeft: [
    { id: "price-left-1", text: "✅ Catálogo VIP con precios rebajados." },
    { id: "price-left-2", text: "✅ Promociones más accesibles que al público general." },
    { id: "price-left-3", text: "✅ Comunidad privada de socios." },
  ],
  pricingBulletsRight: [
    { id: "price-right-1", text: "✅ Plantilla de Excel Premium para el control de ventas profesional." },
    { id: "price-right-2", text: "✅ Publicidad editable en Canva PRO." },
    { id: "price-right-3", text: "✅ Oportunidad de generar ingresos desde casa." },
  ],
  pricingAccessButtonText: "ACTIVAR MI ACCESO",
  pricingAccessButtonHref: "#como-ser-socio",
  pricingPricesButtonText: "VER PRECIOS VIP",
  pricingPricesButtonHref: "/ver-precios",
  promoEnabled: true,
  promoBadge: "PROMOCIÓN EXCLUSIVA",
  promoTitle: "PROMOCIÓN EXCLUSIVA HOY",
  promoPricePen: "10.00",
  promoPriceUsd: "2.67",
  promoOldPricePen: "80.00",
  promoOldPriceUsd: "21.33",
  promoCountdownLabel: "Tiempo restante para que termine el día",
  promoBullets: [
    { id: "promo-1", text: "Ingresas al grupo privado de socios revendedores." },
    { id: "promo-2", text: "Recibes orientación para entender la dinámica del negocio." },
    { id: "promo-3", text: "Empiezas a ofrecer plataformas premium con mejor imagen." },
    { id: "promo-4", text: "Generas ganancias revendiendo con apoyo y respaldo." },
  ],
  promoPrimaryText: "QUIERO APROVECHAR LA PROMO",
  promoSecondaryText: "CERRAR Y SEGUIR VIENDO",
  footerText: "© 2026 Jonas Stream. Todos los derechos reservados.",
  termsText: "Términos y Condiciones",
  privacyText: "Política de Privacidad",
};

function getFactoryDraft(): SocioDraft {
  return JSON.parse(JSON.stringify(initialDraft)) as SocioDraft;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDraft(value: unknown): SocioDraft {
  if (!isObject(value)) return getFactoryDraft();

  const base = getFactoryDraft();
  const merged = { ...base, ...value } as SocioDraft;

  merged.platforms = Array.isArray(value.platforms) ? (value.platforms as PlatformItem[]) : base.platforms;
  merged.profitSteps = Array.isArray(value.profitSteps) ? (value.profitSteps as TextItem[]) : base.profitSteps;
  merged.benefitCards = Array.isArray(value.benefitCards) ? (value.benefitCards as BenefitCard[]) : base.benefitCards;
  merged.receiveBenefits = Array.isArray(value.receiveBenefits) ? (value.receiveBenefits as ReceiveBenefit[]) : base.receiveBenefits;
  merged.affiliateSteps = Array.isArray(value.affiliateSteps) ? (value.affiliateSteps as NumberTextItem[]) : base.affiliateSteps;
  merged.affiliateChips = Array.isArray(value.affiliateChips) ? (value.affiliateChips as TextItem[]) : base.affiliateChips;
  merged.pricingBulletsLeft = Array.isArray(value.pricingBulletsLeft) ? (value.pricingBulletsLeft as TextItem[]) : base.pricingBulletsLeft;
  merged.pricingBulletsRight = Array.isArray(value.pricingBulletsRight) ? (value.pricingBulletsRight as TextItem[]) : base.pricingBulletsRight;
  merged.promoBullets = Array.isArray(value.promoBullets) ? (value.promoBullets as TextItem[]) : base.promoBullets;

  return merged;
}

function isEmptyObject(value: unknown) {
  return isObject(value) && Object.keys(value).length === 0;
}

async function saveContent(action: "save-draft" | "publish", content: SocioDraft) {
  const response = await fetch("/api/editor-web/quiero-ser-socio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, content }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "No se pudo guardar.");
  }

  return response.json();
}

export default function QuieroSocioEditorPage() {
  const [draft, setDraft] = useState<SocioDraft>(getFactoryDraft);
  const [activeGroup, setActiveGroup] = useState<EditorGroup>("Marca");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFactoryModalOpen, setIsFactoryModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      try {
        const response = await fetch("/api/editor-web/quiero-ser-socio", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("No se pudo cargar el editor.");
        }

        const data = (await response.json()) as {
          draftContent?: unknown;
          publishedContent?: unknown;
        };

        const content = isEmptyObject(data.draftContent) ? data.publishedContent : data.draftContent;

        if (!cancelled) {
          setDraft(mergeDraft(content));
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) toast.error("No se pudo cargar. Se usó contenido de fábrica.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, []);

  const previewClass = useMemo(
    () => `${styles.previewSite} ${previewMode === "mobile" ? styles.previewMobile : ""}`,
    [previewMode]
  );

  const previewTheme = useMemo(
    () =>
      ({
        "--preview-primary": draft.primaryColor,
        "--preview-glow": draft.glowColor,
        "--preview-panel": draft.panelColor,
      }) as CSSProperties & Record<string, string>,
    [draft.primaryColor, draft.glowColor, draft.panelColor]
  );

  const updateDraft = <K extends keyof SocioDraft>(key: K, value: SocioDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updatePlatform = <K extends keyof PlatformItem>(id: string, key: K, value: PlatformItem[K]) => {
    setDraft((current) => ({
      ...current,
      platforms: current.platforms.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  };

  const updateTextItem = (listKey: keyof SocioDraft, id: string, field: "text" | "number", value: string) => {
    setDraft((current) => {
      const list = current[listKey];
      if (!Array.isArray(list)) return current;

      return {
        ...current,
        [listKey]: list.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      } as SocioDraft;
    });
  };

  const updateReceiveBenefit = <K extends keyof ReceiveBenefit>(id: string, key: K, value: ReceiveBenefit[K]) => {
    setDraft((current) => ({
      ...current,
      receiveBenefits: current.receiveBenefits.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  const updateBenefitCard = <K extends keyof BenefitCard>(id: string, key: K, value: BenefitCard[K]) => {
    setDraft((current) => ({
      ...current,
      benefitCards: current.benefitCards.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  const saveDraft = async () => {
    try {
      setIsSaving(true);
      await saveContent("save-draft", draft);
      toast.success("Borrador guardado.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const publishDraft = async () => {
    if (!draft.brandName.trim()) {
      toast.error("El nombre de marca no puede quedar vacío.");
      return;
    }

    try {
      setIsPublishing(true);
      await saveContent("publish", draft);
      toast.success("Quiero ser socio publicado.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No se pudo publicar.");
    } finally {
      setIsPublishing(false);
    }
  };

  const resetFactoryDraft = () => {
    setIsFactoryModalOpen(true);
  };

  const confirmFactoryReset = () => {
    setDraft(getFactoryDraft());
    setActiveGroup("Marca");
    setPreviewMode("desktop");
    setIsFactoryModalOpen(false);
    toast.success("Estado de fábrica cargado. Revisa y presiona Publicar para aplicarlo.");
  };

  const sectionTabs = (extraClassName = "") => (
    <div className={`${styles.groupTabs} ${extraClassName}`.trim()} aria-label="Secciones editables">
      {groups.map((group) => (
        <button
          key={group}
          type="button"
          className={activeGroup === group ? styles.activeTab : ""}
          onClick={() => setActiveGroup(group)}
        >
          {group}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <main className={styles.editorShell}>
        <span className={styles.editorSideBrand} aria-hidden="true">
          {draft.sideBrandText || "JONAS STREAM"}
        </span>
        <span className={`${styles.editorSideBrand} ${styles.editorSideBrandRight}`} aria-hidden="true">
          {draft.sideBrandText || "JONAS STREAM"}
        </span>

        <div className={styles.mobileStickyHeader}>
          <section className={styles.editorTopbar}>
            <div className={styles.editorBrandBlock}>
              <h1>Editar Quiero ser socio</h1>
              <p className={styles.editorBrandSubtitle}>Editor web / socios</p>
            </div>

            <div className={styles.topbarActions}>
              <Link href="/admin/editor-web" className={styles.secondaryButton}>
                Volver
              </Link>
              <button
                type="button"
                className={`${styles.secondaryButton} ${styles.factoryButton}`}
                onClick={resetFactoryDraft}
                disabled={isSaving || isPublishing || isLoading}
              >
                Restablecer fábrica
              </button>
              <button type="button" className={styles.secondaryButton} onClick={saveDraft} disabled={isSaving || isLoading}>
                {isSaving ? "Guardando..." : "Guardar borrador"}
              </button>
              <button type="button" className={styles.primaryButton} onClick={publishDraft} disabled={isPublishing || isLoading}>
                {isPublishing ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </section>

          {sectionTabs(styles.mobileGroupTabs)}
        </div>

        <section className={styles.workspace}>
          <aside className={styles.editorPanel}>
            {sectionTabs(styles.desktopGroupTabs)}

            <div className={styles.formCard}>
              {activeGroup === "Marca" && (
                <>
                  <Field label="Nombre de marca" value={draft.brandName} onChange={(value) => updateDraft("brandName", value)} />
                  <Field label="Subtítulo de marca" value={draft.brandSubtitle} onChange={(value) => updateDraft("brandSubtitle", value)} />
                  <Field label="Texto botón Inicio" value={draft.navInicioText} onChange={(value) => updateDraft("navInicioText", value)} />
                  <Field label="URL botón Inicio" value={draft.navInicioHref} onChange={(value) => updateDraft("navInicioHref", value)} />
                  <Field label="Texto botón precios" value={draft.navPricesText} onChange={(value) => updateDraft("navPricesText", value)} />
                  <Field label="URL botón precios" value={draft.navPricesHref} onChange={(value) => updateDraft("navPricesHref", value)} />
                  <Field label="Texto botón socio superior" value={draft.navSocioText} onChange={(value) => updateDraft("navSocioText", value)} />
                  <Field label="URL botón socio superior" value={draft.navSocioHref} onChange={(value) => updateDraft("navSocioHref", value)} />
                  <Field label="Número WhatsApp" value={draft.whatsappNumber} onChange={(value) => updateDraft("whatsappNumber", value)} helper="Coloca solo números. Ejemplo Perú: 51900557949." />
                  <Field label="Mensaje WhatsApp" value={draft.whatsappMessage} onChange={(value) => updateDraft("whatsappMessage", value)} multiline />
                </>
              )}

              {activeGroup === "Hero" && (
                <>
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
                  <ToggleField label="Mostrar modal de promoción" enabled={draft.promoEnabled} onChange={(value) => updateDraft("promoEnabled", value)} />
                  <Field label="Etiqueta modal" value={draft.promoBadge} onChange={(value) => updateDraft("promoBadge", value)} />
                  <Field label="Título modal" value={draft.promoTitle} onChange={(value) => updateDraft("promoTitle", value)} />
                  <Field label="Precio actual S/" value={draft.promoPricePen} onChange={(value) => updateDraft("promoPricePen", value)} />
                  <Field label="Precio actual USD" value={draft.promoPriceUsd} onChange={(value) => updateDraft("promoPriceUsd", value)} />
                  <Field label="Precio anterior S/" value={draft.promoOldPricePen} onChange={(value) => updateDraft("promoOldPricePen", value)} />
                  <Field label="Precio anterior USD" value={draft.promoOldPriceUsd} onChange={(value) => updateDraft("promoOldPriceUsd", value)} />
                  <Field label="Texto countdown" value={draft.promoCountdownLabel} onChange={(value) => updateDraft("promoCountdownLabel", value)} />
                  {draft.promoBullets.map((item, index) => (
                    <Field key={item.id} label={`Punto modal ${index + 1}`} value={item.text} onChange={(value) => updateTextItem("promoBullets", item.id, "text", value)} />
                  ))}
                  <Field label="Botón principal modal" value={draft.promoPrimaryText} onChange={(value) => updateDraft("promoPrimaryText", value)} />
                  <Field label="Botón secundario modal" value={draft.promoSecondaryText} onChange={(value) => updateDraft("promoSecondaryText", value)} />
                </>
              )}

              {activeGroup === "Plataformas" && (
                <>
                  <Field label="Etiqueta sección" value={draft.platformsKicker} onChange={(value) => updateDraft("platformsKicker", value)} />
                  <Field label="Título sección" value={draft.platformsTitle} onChange={(value) => updateDraft("platformsTitle", value)} />
                  <div className={styles.editorList}>
                    {draft.platforms.map((platform) => (
                      <article key={platform.id} className={styles.editorItem}>
                        <ToggleField label={platform.name || platform.id} enabled={platform.enabled} onChange={(value) => updatePlatform(platform.id, "enabled", value)} />
                        <Field label="Nombre" value={platform.name} onChange={(value) => updatePlatform(platform.id, "name", value)} />
                        <ColorField label="Color" value={platform.color} onChange={(value) => updatePlatform(platform.id, "color", value)} />
                        <SelectField label="Clase visual" value={platform.cssClass} options={platformClassOptions} onChange={(value) => updatePlatform(platform.id, "cssClass", value)} />
                      </article>
                    ))}
                  </div>
                </>
              )}

              {activeGroup === "Rentabilidad" && (
                <>
                  <Field label="Etiqueta" value={draft.profitKicker} onChange={(value) => updateDraft("profitKicker", value)} />
                  <Field label="Título" value={draft.profitTitle} onChange={(value) => updateDraft("profitTitle", value)} />
                  <Field label="Texto explicativo" value={draft.profitLead} onChange={(value) => updateDraft("profitLead", value)} multiline />
                  <Field label="Etiqueta ganancia" value={draft.profitLabel} onChange={(value) => updateDraft("profitLabel", value)} />
                  <Field label="Monto ganancia" value={draft.profitAmount} onChange={(value) => updateDraft("profitAmount", value)} />
                  <Field label="Texto ejemplo" value={draft.profitExampleText} onChange={(value) => updateDraft("profitExampleText", value)} />
                  {draft.profitSteps.map((item, index) => (
                    <Field key={item.id} label={`Paso ${index + 1}`} value={item.text} onChange={(value) => updateTextItem("profitSteps", item.id, "text", value)} multiline />
                  ))}
                </>
              )}

              {activeGroup === "Ventajas" && (
                <>
                  <Field label="Etiqueta" value={draft.accessKicker} onChange={(value) => updateDraft("accessKicker", value)} />
                  <Field label="Título" value={draft.accessTitle} onChange={(value) => updateDraft("accessTitle", value)} />
                  {draft.benefitCards.map((card, index) => (
                    <article key={card.id} className={styles.editorItem}>
                      <h3>Cuadro {index + 1}</h3>
                      <Field label="Etiqueta" value={card.kicker} onChange={(value) => updateBenefitCard(card.id, "kicker", value)} />
                      <Field label="Título" value={card.title} onChange={(value) => updateBenefitCard(card.id, "title", value)} />
                      <Field label="Texto" value={card.text} onChange={(value) => updateBenefitCard(card.id, "text", value)} multiline />
                      <Field label="Texto botón" value={card.buttonText} onChange={(value) => updateBenefitCard(card.id, "buttonText", value)} />
                      <Field label="URL botón" value={card.buttonHref} onChange={(value) => updateBenefitCard(card.id, "buttonHref", value)} />
                      <SelectField label="Color" value={card.variant} options={["red", "cyan"]} onChange={(value) => updateBenefitCard(card.id, "variant", value as "red" | "cyan")} />
                    </article>
                  ))}
                </>
              )}

              {activeGroup === "Beneficios" && (
                <>
                  <Field label="Etiqueta" value={draft.receiveKicker} onChange={(value) => updateDraft("receiveKicker", value)} />
                  <Field label="Título" value={draft.receiveTitle} onChange={(value) => updateDraft("receiveTitle", value)} />
                  {draft.receiveBenefits.map((item, index) => (
                    <article key={item.id} className={styles.editorItem}>
                      <h3>Beneficio {index + 1}</h3>
                      <Field label="Título" value={item.title} onChange={(value) => updateReceiveBenefit(item.id, "title", value)} />
                      <Field label="Texto" value={item.text} onChange={(value) => updateReceiveBenefit(item.id, "text", value)} multiline />
                    </article>
                  ))}
                </>
              )}

              {activeGroup === "Afiliación" && (
                <>
                  <Field label="Etiqueta" value={draft.affiliateKicker} onChange={(value) => updateDraft("affiliateKicker", value)} />
                  <Field label="Título" value={draft.affiliateTitle} onChange={(value) => updateDraft("affiliateTitle", value)} />
                  <Field label="Texto" value={draft.affiliateText} onChange={(value) => updateDraft("affiliateText", value)} multiline />
                  {draft.affiliateSteps.map((item, index) => (
                    <article key={item.id} className={styles.editorItem}>
                      <h3>Paso afiliación {index + 1}</h3>
                      <Field label="Número" value={item.number} onChange={(value) => updateTextItem("affiliateSteps", item.id, "number", value)} />
                      <Field label="Texto" value={item.text} onChange={(value) => updateTextItem("affiliateSteps", item.id, "text", value)} multiline />
                    </article>
                  ))}
                  {draft.affiliateChips.map((item, index) => (
                    <Field key={item.id} label={`Chip ${index + 1}`} value={item.text} onChange={(value) => updateTextItem("affiliateChips", item.id, "text", value)} />
                  ))}
                </>
              )}

              {activeGroup === "Cómo ser socio" && (
                <>
                  <Field label="Etiqueta" value={draft.pricingKicker} onChange={(value) => updateDraft("pricingKicker", value)} />
                  <Field label="Título" value={draft.pricingTitle} onChange={(value) => updateDraft("pricingTitle", value)} />
                  <Field label="Precio S/" value={draft.pricingPricePen} onChange={(value) => updateDraft("pricingPricePen", value)} />
                  <Field label="Precio USD" value={draft.pricingPriceUsd} onChange={(value) => updateDraft("pricingPriceUsd", value)} />
                  <Field label="Antes S/" value={draft.pricingOldPricePen} onChange={(value) => updateDraft("pricingOldPricePen", value)} />
                  <Field label="Antes USD" value={draft.pricingOldPriceUsd} onChange={(value) => updateDraft("pricingOldPriceUsd", value)} />
                  <Field label="Tipo de cambio visible" value={draft.usdRate} onChange={(value) => updateDraft("usdRate", value)} helper="Se mostrará como: 1 USD = S/ 3.75. Puedes cambiarlo aquí." />
                  {draft.pricingBulletsLeft.map((item, index) => (
                    <Field key={item.id} label={`Beneficio izquierda ${index + 1}`} value={item.text} onChange={(value) => updateTextItem("pricingBulletsLeft", item.id, "text", value)} />
                  ))}
                  {draft.pricingBulletsRight.map((item, index) => (
                    <Field key={item.id} label={`Beneficio derecha ${index + 1}`} value={item.text} onChange={(value) => updateTextItem("pricingBulletsRight", item.id, "text", value)} />
                  ))}
                  <Field label="Botón precios" value={draft.pricingPricesButtonText} onChange={(value) => updateDraft("pricingPricesButtonText", value)} />
                  <Field label="URL botón precios" value={draft.pricingPricesButtonHref} onChange={(value) => updateDraft("pricingPricesButtonHref", value)} />
                  <Field label="Botón acceso" value={draft.pricingAccessButtonText} onChange={(value) => updateDraft("pricingAccessButtonText", value)} />
                  <Field label="URL botón acceso" value={draft.pricingAccessButtonHref} onChange={(value) => updateDraft("pricingAccessButtonHref", value)} />
                </>
              )}

              {activeGroup === "Footer" && (
                <>
                  <Field label="Texto footer" value={draft.footerText} onChange={(value) => updateDraft("footerText", value)} />
                  <Field label="Texto enlace términos" value={draft.termsText} onChange={(value) => updateDraft("termsText", value)} />
                  <Field label="Texto enlace privacidad" value={draft.privacyText} onChange={(value) => updateDraft("privacyText", value)} />
                  <div className={styles.helpBox}>Los textos legales completos ya quedan conectados en la página pública con modal completo y scroll.</div>
                </>
              )}

              {activeGroup === "Colores" && (
                <>
                  <ColorField label="Color principal" value={draft.primaryColor} onChange={(value) => updateDraft("primaryColor", value)} />
                  <ColorField label="Color glow" value={draft.glowColor} onChange={(value) => updateDraft("glowColor", value)} />
                  <Field label="Color panel glass" value={draft.panelColor} onChange={(value) => updateDraft("panelColor", value)} helper="Ejemplo: rgba(3, 19, 22, 0.78)" />
                  <ToggleField label="Mostrar marca lateral" enabled={draft.showSideBrand} onChange={(value) => updateDraft("showSideBrand", value)} />
                  <Field label="Texto marca lateral" value={draft.sideBrandText} onChange={(value) => updateDraft("sideBrandText", value)} />
                </>
              )}
            </div>

            <div className={styles.saveBar}>
              <button type="button" className={`${styles.secondaryButton} ${styles.factoryButton}`} onClick={resetFactoryDraft} disabled={isSaving || isPublishing || isLoading}>
                Restablecer fábrica
              </button>
              <button type="button" className={styles.secondaryButton} onClick={saveDraft} disabled={isSaving || isLoading}>
                {isSaving ? "Guardando..." : "Guardar borrador"}
              </button>
              <button type="button" className={styles.primaryButton} onClick={publishDraft} disabled={isPublishing || isLoading}>
                {isPublishing ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </aside>

          <section className={styles.previewPanel} aria-label="Vista previa de Quiero ser socio">
            <div className={styles.previewToolbar}>
              <div>
                <p className={styles.kicker}>Vista previa</p>
                <h2>Quiero ser socio</h2>
              </div>
              <div className={styles.previewSwitch}>
                <button type="button" className={previewMode === "desktop" ? styles.activePreview : ""} onClick={() => setPreviewMode("desktop")}>
                  PC
                </button>
                <button type="button" className={previewMode === "mobile" ? styles.activePreview : ""} onClick={() => setPreviewMode("mobile")}>
                  Celular
                </button>
              </div>
            </div>

            <div className={styles.previewFrameOuter}>
              <div className={previewClass} style={previewTheme}>
                {draft.showSideBrand ? (
                  <>
                    <span className={styles.previewSideBrand}>{draft.sideBrandText}</span>
                    <span className={`${styles.previewSideBrand} ${styles.previewSideBrandRight}`}>{draft.sideBrandText}</span>
                  </>
                ) : null}

                <div className={styles.previewTopbar}>
                  <div>
                    <strong>{draft.brandName}</strong>
                    <span>{draft.brandSubtitle}</span>
                  </div>
                  <nav className={styles.previewNav}>
                    <span>{draft.navInicioText}</span>
                    <span>{draft.navPricesText}</span>
                    <span className={styles.previewSocio}>{draft.navSocioText}</span>
                  </nav>
                </div>

                <section className={styles.previewHero}>
                  <p className={styles.previewMini}>{draft.heroBadge}</p>
                  <h3>
                    {draft.heroTitleOne}
                    <br />
                    {draft.heroTitleTwo}
                    <br />
                    {draft.heroTitleThree} <b>{draft.heroHighlight}</b>
                  </h3>
                  <p>{draft.heroDescription}</p>
                  <div className={styles.previewButtons}>
                    <span>{draft.heroPrimaryText}</span>
                    <span>{draft.heroSecondaryText}</span>
                  </div>
                </section>

                <section className={styles.previewSection}>
                  <p className={styles.previewMini}>{draft.platformsKicker}</p>
                  <h4>{draft.platformsTitle}</h4>
                  <div className={styles.previewPlatforms}>
                    {draft.platforms.filter((item) => item.enabled).map((item) => (
                      <span key={item.id} style={{ "--platform-color": item.color } as CSSProperties}>
                        {item.name}
                      </span>
                    ))}
                  </div>
                </section>

                <section className={styles.previewSection}>
                  <p className={styles.previewMini}>{draft.profitKicker}</p>
                  <h4>{draft.profitTitle}</h4>
                  <div className={styles.previewProfitGrid}>
                    <article>
                      <p>{draft.profitLead}</p>
                      <div className={styles.previewProfitBox}>
                        <small>{draft.profitLabel}</small>
                        <strong>{draft.profitAmount}</strong>
                        <span>{draft.profitExampleText}</span>
                      </div>
                    </article>
                    <article className={styles.previewSteps}>
                      {draft.profitSteps.map((item, index) => (
                        <p key={item.id}>
                          <b>{index + 1}</b> {item.text}
                        </p>
                      ))}
                    </article>
                  </div>
                </section>

                <section className={styles.previewSection}>
                  <p className={styles.previewMini}>{draft.accessKicker}</p>
                  <h4>{draft.accessTitle}</h4>
                  <div className={styles.previewTwoCards}>
                    {draft.benefitCards.map((card) => (
                      <article key={card.id} className={card.variant === "red" ? styles.previewRedCard : styles.previewCyanCard}>
                        <span>{card.kicker}</span>
                        <h5>{card.title}</h5>
                        <p>{card.text}</p>
                        <b>{card.buttonText}</b>
                      </article>
                    ))}
                  </div>
                </section>

                <section className={styles.previewSection}>
                  <p className={styles.previewMini}>{draft.receiveKicker}</p>
                  <h4>{draft.receiveTitle}</h4>
                  <div className={styles.previewBenefitsGrid}>
                    {draft.receiveBenefits.map((item, index) => (
                      <article key={item.id}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <h5>{item.title}</h5>
                        <p>{item.text}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className={styles.previewSection}>
                  <p className={styles.previewMini}>{draft.affiliateKicker}</p>
                  <h4>{draft.affiliateTitle}</h4>
                  <p>{draft.affiliateText}</p>
                  <div className={styles.previewAffiliateSteps}>
                    {draft.affiliateSteps.map((item) => (
                      <article key={item.id}>
                        <b>{item.number}</b>
                        <p>{item.text}</p>
                      </article>
                    ))}
                  </div>
                  <div className={styles.previewAffiliateChips}>
                    {draft.affiliateChips.map((chip) => (
                      <span key={chip.id}>{chip.text}</span>
                    ))}
                  </div>
                </section>

                <section id="como-ser-socio" className={styles.previewSection}>
                  <p className={styles.previewMini}>{draft.pricingKicker}</p>
                  <h4>{draft.pricingTitle}</h4>
                  <div className={styles.previewPriceBox}>
                    <strong>S/ {draft.pricingPricePen}</strong>
                    <span>USD {draft.pricingPriceUsd}</span>
                    <small>Antes: S/ {draft.pricingOldPricePen} - USD {draft.pricingOldPriceUsd}</small>
                    <em>1 USD = S/ {draft.usdRate}</em>
                  </div>
                  <div className={styles.previewPricingBullets}>
                    {[...draft.pricingBulletsLeft, ...draft.pricingBulletsRight].map((item) => (
                      <span key={item.id}>{item.text}</span>
                    ))}
                  </div>
                  <div className={styles.previewButtons}>
                    <span>{draft.pricingPricesButtonText}</span>
                    <span>{draft.pricingAccessButtonText}</span>
                  </div>
                </section>

                <footer className={styles.previewFooter}>
                  <p>{draft.footerText}</p>
                  <span>{draft.termsText}</span>
                  <span>{draft.privacyText}</span>
                </footer>
              </div>
            </div>
          </section>
        </section>
      </main>

      {isFactoryModalOpen ? (
        <div className={styles.factoryModalOverlay} role="dialog" aria-modal="true">
          <button type="button" className={styles.factoryModalBackdrop} aria-label="Cerrar confirmación" onClick={() => setIsFactoryModalOpen(false)} />

          <section className={styles.factoryModalCard}>
            <div className={styles.factoryModalIcon}>↻</div>
            <p className={styles.kicker}>SEGURIDAD / SOCIOS</p>
            <h2>Restablecer estado de fábrica</h2>
            <p className={styles.factoryModalText}>
              Esto cargará los datos originales de Jonas Stream en el editor de Quiero ser socio. No cambiará la web pública hasta que presiones Publicar.
            </p>
            <div className={styles.factoryModalPreview}>
              <strong>JONAS STREAM</strong>
              <span>Editor web / Quiero ser socio</span>
            </div>
            <div className={styles.factoryModalActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsFactoryModalOpen(false)}>
                Cancelar
              </button>
              <button type="button" className={`${styles.primaryButton} ${styles.factoryConfirmButton}`} onClick={confirmFactoryReset}>
                Sí, restablecer
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  helper,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
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
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.colorInputRow}>
        <input type="color" value={value.startsWith("#") ? value : "#01e7ef"} onChange={(event) => onChange(event.target.value)} />
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className={styles.toggleField}>
      <span>{label}</span>
      <button type="button" className={enabled ? styles.toggleOn : ""} onClick={() => onChange(!enabled)}>
        {enabled ? "Activo" : "Oculto"}
      </button>
    </div>
  );
}
