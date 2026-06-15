"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

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
  number?: string;
};

type BenefitCard = TextItem & {
  title: string;
  kicker: string;
  variant: "red" | "cyan" | "green" | string;
  buttonHref: string;
  buttonText: string;
};

type ReceiveBenefit = TextItem & {
  title: string;
};

type SocioContent = {
  usdRate: string;
  brandName: string;
  brandSubtitle: string;
  primaryColor: string;
  glowColor: string;
  panelColor: string;
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
  promoCountdownLabel: string;
  promoPrimaryText: string;
  promoSecondaryText: string;
  promoBenefits: TextItem[];

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
  pricingOldPricePen: string;
  pricingBulletsLeft: TextItem[];
  pricingBulletsRight: TextItem[];
  pricingPricesButtonText: string;
  pricingPricesButtonHref: string;
  pricingAccessButtonText: string;

  termsText: string;
  privacyText: string;
  footerText: string;
};

const factoryContent: SocioContent = {
  usdRate: "3.75",
  brandName: "JONAS STREAM",
  brandSubtitle: "PLATAFORMA OFICIAL",
  primaryColor: "#01E7EF",
  glowColor: "#00FBFF",
  panelColor: "rgba(3, 19, 22, 0.78)",
  sideBrandText: "JONAS STREAM",
  showSideBrand: true,

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

  promoEnabled: true,
  promoBadge: "PROMOCIÓN EXCLUSIVA",
  promoTitle: "PROMOCIÓN EXCLUSIVA HOY",
  promoPricePen: "10.00",
  promoOldPricePen: "80.00",
  promoCountdownLabel: "Tiempo restante para que termine el día",
  promoPrimaryText: "QUIERO APROVECHAR LA PROMO",
  promoSecondaryText: "CERRAR Y SEGUIR VIENDO",
  promoBenefits: [
    { id: "promo-1", text: "Ingresas al grupo privado de socios revendedores." },
    { id: "promo-2", text: "Recibes orientación para entender la dinámica del negocio." },
    { id: "promo-3", text: "Empiezas a ofrecer plataformas premium con mejor imagen." },
    { id: "promo-4", text: "Generas ganancias revendiendo con apoyo y respaldo." },
  ],

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
      variant: "red",
      buttonHref: "#",
      buttonText: "IR AL GRUPO OFICIAL",
    },
    {
      id: "benefit-cyan",
      kicker: "SEGUNDO BENEFICIO",
      title: "Catálogo VIP",
      text: "Accede a un catálogo VIP con excelentes precios, actualizado constantemente, para revender y tener un buen margen de ganancia.",
      variant: "cyan",
      buttonHref: "/ver-precios",
      buttonText: "VER PRECIOS VIP",
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

  termsText: "Términos y Condiciones",
  privacyText: "Política de Privacidad",
  footerText: "© 2026 Jonas Stream. Todos los derechos reservados.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function mergeSocioContent(raw: unknown): SocioContent {
  if (!isRecord(raw)) return factoryContent;

  return {
    ...factoryContent,
    ...raw,
    promoBenefits: readArray<TextItem>(raw.promoBenefits, factoryContent.promoBenefits),
    platforms: readArray<PlatformItem>(raw.platforms, factoryContent.platforms),
    profitSteps: readArray<TextItem>(raw.profitSteps, factoryContent.profitSteps),
    benefitCards: readArray<BenefitCard>(raw.benefitCards, factoryContent.benefitCards),
    receiveBenefits: readArray<ReceiveBenefit>(raw.receiveBenefits, factoryContent.receiveBenefits),
    affiliateSteps: readArray<NumberTextItem>(raw.affiliateSteps, factoryContent.affiliateSteps),
    affiliateChips: readArray<TextItem>(raw.affiliateChips, factoryContent.affiliateChips),
    pricingBulletsLeft: readArray<TextItem>(raw.pricingBulletsLeft, factoryContent.pricingBulletsLeft),
    pricingBulletsRight: readArray<TextItem>(raw.pricingBulletsRight, factoryContent.pricingBulletsRight),
  } as SocioContent;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toNumber(value: string) {
  const normalized = String(value || "0")
    .replace(/[^\d.,]/g, "")
    .replace(",", ".");

  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function money(value: string) {
  return toNumber(value).toFixed(2);
}

function buildWhatsappUrl(number: string, message: string) {
  const cleanNumber = String(number || "").replace(/\D/g, "");
  const cleanMessage = encodeURIComponent(message || "Hola Jonas Stream, quiero ser socio.");
  return cleanNumber ? `https://wa.me/${cleanNumber}?text=${cleanMessage}` : "#";
}

function hexToRgbString(hex: string) {
  const clean = String(hex || "#00fbff").replace("#", "").trim();
  const expanded = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  const parsed = Number.parseInt(expanded.slice(0, 6), 16);

  if (!Number.isFinite(parsed)) return "0, 251, 255";

  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;

  return `${r}, ${g}, ${b}`;
}

function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function SmartLink({ href, className, children, onClick }: { href: string; className?: string; children: ReactNode; onClick?: () => void }) {
  const safeHref = href?.trim() || "#";

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {children}
      </button>
    );
  }

  if (safeHref.startsWith("#") || isExternalHref(safeHref)) {
    return (
      <a
        href={safeHref}
        className={className}
        target={isExternalHref(safeHref) ? "_blank" : undefined}
        rel={isExternalHref(safeHref) ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={safeHref} className={className}>
      {children}
    </Link>
  );
}

function getEndOfDayTimeLeft(now: Date) {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const diff = Math.max(0, end.getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function QuieroSerSocioPage() {
  const [content, setContent] = useState<SocioContent>(factoryContent);
  const [now, setNow] = useState(() => new Date());
  const [promoOpen, setPromoOpen] = useState(factoryContent.promoEnabled);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPublishedContent() {
      try {
        let response = await fetch(`/api/editor-web/public/quiero-ser-socio?t=${Date.now()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          response = await fetch(`/api/editor-web/quiero-ser-socio?t=${Date.now()}`, {
            cache: "no-store",
          });
        }

        if (!response.ok) return;

        const data = (await response.json()) as {
          content?: unknown;
          publishedContent?: unknown;
        };

        const publishedContent = data.content ?? data.publishedContent ?? {};

        if (!cancelled) {
          const merged = mergeSocioContent(publishedContent);
          setContent(merged);
          setPromoOpen(Boolean(merged.promoEnabled));
        }
      } catch (error) {
        console.error("No se pudo cargar Quiero ser socio publicado.", error);
      }
    }

    loadPublishedContent();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = getEndOfDayTimeLeft(now);
  const usdRate = toNumber(content.usdRate) || 3.75;
  const promoUsd = usdRate > 0 ? (toNumber(content.promoPricePen) / usdRate).toFixed(2) : "0.00";
  const promoOldUsd = usdRate > 0 ? (toNumber(content.promoOldPricePen) / usdRate).toFixed(2) : "0.00";
  const pricingUsd = usdRate > 0 ? (toNumber(content.pricingPricePen) / usdRate).toFixed(2) : "0.00";
  const whatsappUrl = useMemo(
    () => buildWhatsappUrl(content.whatsappNumber, content.whatsappMessage),
    [content.whatsappNumber, content.whatsappMessage]
  );

  const themeStyle = useMemo(
    () =>
      ({
        "--cyan": content.primaryColor,
        "--cyan-strong": content.glowColor,
        "--glass-panel": content.panelColor,
      }) as CSSProperties,
    [content.primaryColor, content.glowColor, content.panelColor]
  );

  const navSocioHref =
    content.navSocioHref && content.navSocioHref !== "/quiero-ser-socio"
      ? content.navSocioHref
      : whatsappUrl;

  return (
    <main className={styles.page} style={themeStyle}>
      <span className={styles.bgGlowOne} aria-hidden="true" />
      <span className={styles.bgGlowTwo} aria-hidden="true" />
      <span className={styles.gridOverlay} aria-hidden="true" />

      {content.showSideBrand ? (
        <>
          <span className={styles.sideBrand} aria-hidden="true">{content.sideBrandText}</span>
          <span className={cx(styles.sideBrand, styles.sideBrandRight)} aria-hidden="true">
            {content.sideBrandText}
          </span>
        </>
      ) : null}

      {content.promoEnabled && promoOpen ? (
        <section className={styles.promoOverlay} aria-label="Promoción exclusiva">
          <button type="button" className={styles.promoBackdrop} aria-label="Cerrar promoción" onClick={() => setPromoOpen(false)} />
          <article className={styles.promoModal}>
            <button type="button" className={styles.closeButton} onClick={() => setPromoOpen(false)} aria-label="Cerrar">
              ×
            </button>
            <span className={styles.promoBadge}>{content.promoBadge}</span>
            <h2 className={styles.promoTitle}>{content.promoTitle}</h2>

            <div className={styles.promoPriceBox}>
              <div className={styles.promoPriceMain}>S/ {money(content.promoPricePen)}</div>
              <div className={styles.promoPriceUsd}>USD {promoUsd}</div>
              <div className={styles.promoOldPrice}>Antes: S/ {money(content.promoOldPricePen)} · USD {promoOldUsd}</div>
            </div>

            <div className={styles.countdownWrap}>
              <span className={styles.countdownLabel}>{content.promoCountdownLabel}</span>
              <div className={styles.countdown}>
                <div className={styles.countBox}><strong>{pad(countdown.days)}</strong><span>DÍAS</span></div>
                <div className={styles.countBox}><strong>{pad(countdown.hours)}</strong><span>HORAS</span></div>
                <div className={styles.countBox}><strong>{pad(countdown.minutes)}</strong><span>MIN</span></div>
                <div className={styles.countBox}><strong>{pad(countdown.seconds)}</strong><span>SEG</span></div>
              </div>
            </div>

            <div className={styles.promoBenefits}>
              {content.promoBenefits.map((item) => (
                <div key={item.id} className={styles.promoBenefit}>
                  <span className={styles.dot} aria-hidden="true" />
                  <p>{item.text}</p>
                </div>
              ))}
            </div>

            <div className={styles.promoActions}>
              <SmartLink href={whatsappUrl} className={styles.primaryAction}>{content.promoPrimaryText}</SmartLink>
              <SmartLink href="#" className={styles.secondaryAction} onClick={() => setPromoOpen(false)}>
                {content.promoSecondaryText}
              </SmartLink>
            </div>

            <p className={styles.rateNote}>1 USD = S/ {content.usdRate}</p>
          </article>
        </section>
      ) : null}

      {legalModal ? (
        <section className={styles.legalOverlay} aria-label="Información legal">
          <button type="button" className={styles.legalBackdrop} aria-label="Cerrar" onClick={() => setLegalModal(null)} />
          <article className={styles.legalModal}>
            <header className={styles.legalHeader}>
              <div>
                <span>JONAS STREAM</span>
                <h2>{legalModal === "terms" ? content.termsText : content.privacyText}</h2>
              </div>
              <button type="button" className={styles.legalClose} onClick={() => setLegalModal(null)} aria-label="Cerrar">
                ×
              </button>
            </header>
            <div className={styles.legalBody}>
              <span className={styles.legalDate}>Actualizado 2026</span>
              <p className={styles.legalIntro}>
                Esta sección mantiene la información legal básica de Jonas Stream. Luego puedes conectarla al editor legal independiente.
              </p>
              <section className={styles.legalSection}>
                <h3>{legalModal === "terms" ? "Condiciones de uso" : "Privacidad"}</h3>
                <p>
                  El contenido, precios, promociones y beneficios pueden variar según disponibilidad. La atención se realiza por los canales oficiales indicados en la página.
                </p>
              </section>
              <div className={styles.legalNotice}>Para consultas específicas, comunícate por WhatsApp con Jonas Stream.</div>
            </div>
          </article>
        </section>
      ) : null}

      <div className={styles.topbarWrap}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brandBlock}>
            <strong>{content.brandName}</strong>
            <span>{content.brandSubtitle}</span>
          </Link>

          <nav className={styles.topActions} aria-label="Navegación principal">
            <SmartLink href={content.navInicioHref} className={styles.topLink}>{content.navInicioText}</SmartLink>
            <SmartLink href={content.navPricesHref} className={styles.topLinkPrimary}>{content.navPricesText}</SmartLink>
            <SmartLink href={navSocioHref} className={cx(styles.topLink, styles.topLinkSocio)}>{content.navSocioText}</SmartLink>
          </nav>
        </header>
      </div>

      <div className={styles.mainContent}>
        <section className={styles.hero}>
          <span className={styles.heroBadge}>{content.heroBadge}</span>
          <h1 className={styles.heroTitle}>
            {content.heroTitleOne}<br />
            {content.heroTitleTwo}<br />
            {content.heroTitleThree} <span>{content.heroHighlight}</span>
          </h1>
          <p className={styles.heroText}>{content.heroDescription}</p>
          <div className={styles.heroActions}>
            <SmartLink href={content.heroPrimaryHref || "#como-ser-socio"} className={styles.heroBtnPrimary}>
              {content.heroPrimaryText}
            </SmartLink>
            <SmartLink href={content.heroSecondaryHref} className={styles.heroBtnSecondary}>
              {content.heroSecondaryText}
            </SmartLink>
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>{content.platformsKicker}</span>
            <h2 className={styles.sectionTitle}>{content.platformsTitle}</h2>
          </header>
          <div className={styles.platformsGrid}>
            {content.platforms.filter((platform) => platform.enabled).map((platform) => (
              <div
                key={platform.id}
                className={cx(styles.platformCard, styles[platform.cssClass])}
                style={{ "--app-color": platform.color, "--app-rgb": hexToRgbString(platform.color) } as CSSProperties}
              >
                {platform.name}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>{content.profitKicker}</span>
            <h2 className={styles.sectionTitle}>{content.profitTitle}</h2>
          </header>
          <div className={styles.exampleHorizontal}>
            <div className={styles.exampleLeft}>
              <p className={styles.exampleLead}>{content.profitLead}</p>
              <div className={styles.exampleProfitBox}>
                <span className={styles.exampleProfitLabel}>{content.profitLabel}</span>
                <strong>{content.profitAmount}</strong>
                <small>{content.profitExampleText}</small>
              </div>
            </div>
            <div className={styles.exampleRight}>
              {content.profitSteps.map((step, index) => (
                <div key={step.id} className={styles.stepItem}>
                  <span>{index + 1}</span>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.benefitsSection}>
          <header className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>{content.accessKicker}</span>
            <h2 className={styles.sectionTitle}>{content.accessTitle}</h2>
          </header>
          <div className={styles.extraBenefitsUnified}>
            {content.benefitCards.map((card) => {
              const cardClass = card.variant === "red" ? styles.netflixCard : styles.greenCard;
              const linkClass = card.variant === "red" ? styles.netflixLink : styles.vipLink;

              return (
                <article key={card.id} className={cx(styles.infoCard, cardClass)}>
                  <span className={styles.infoKicker}>{card.kicker}</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <SmartLink href={card.buttonHref} className={linkClass}>{card.buttonText}</SmartLink>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>{content.receiveKicker}</span>
            <h2 className={styles.sectionTitle}>{content.receiveTitle}</h2>
          </header>
          <div className={styles.benefitsGrid}>
            {content.receiveBenefits.map((benefit, index) => (
              <article key={benefit.id} className={cx(styles.benefitCard, styles.dynamicBenefit)}>
                <span className={styles.benefitNumber}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.affiliateSection}>
          <div className={styles.affiliateBox}>
            <header className={styles.affiliateHeader}>
              <span>{content.affiliateKicker}</span>
              <h3>{content.affiliateTitle}</h3>
              <p>{content.affiliateText}</p>
            </header>
            <div className={styles.affiliateGrid}>
              {content.affiliateSteps.map((step, index) => (
                <article key={step.id} className={styles.affiliateStep}>
                  <strong>{step.number || String(index + 1).padStart(2, "0")}</strong>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
            <div className={styles.affiliateBenefits}>
              {content.affiliateChips.map((chip) => (
                <span key={chip.id}>✅ {chip.text}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="como-ser-socio" className={styles.pricingSection}>
          <div className={styles.pricingCard}>
            <header className={styles.sectionHeaderCenter}>
              <span className={styles.sectionKicker}>{content.pricingKicker}</span>
              <h2 className={styles.sectionTitle}>{content.pricingTitle}</h2>
            </header>

            <div className={styles.pricingMain}>
              <div className={styles.priceNow}>S/ {money(content.pricingPricePen)}</div>
              <div className={styles.priceUsd}>USD {pricingUsd}</div>
              <div className={styles.priceBefore}>Antes: S/ {money(content.pricingOldPricePen)}</div>
              <div className={styles.rateInline}>1 USD = S/ {content.usdRate}</div>
            </div>

            <div className={styles.pricingListTwoColumns}>
              <div className={styles.pricingColumn}>
                {content.pricingBulletsLeft.map((item) => (
                  <div key={item.id} className={styles.pricingItem}>✅ {item.text}</div>
                ))}
              </div>
              <div className={styles.pricingColumn}>
                {content.pricingBulletsRight.map((item) => (
                  <div key={item.id} className={styles.pricingItem}>✅ {item.text}</div>
                ))}
              </div>
            </div>

            <div className={styles.pricingActions}>
              <SmartLink href={content.pricingPricesButtonHref} className={styles.heroBtnSecondary}>
                {content.pricingPricesButtonText}
              </SmartLink>
              <SmartLink href={whatsappUrl} className={styles.heroBtnPrimary}>
                {content.pricingAccessButtonText}
              </SmartLink>
            </div>
          </div>
        </section>

        <footer className={styles.footerWrap}>
          <div className={styles.footerLegal}>
            <p>{content.footerText}</p>
            <div className={styles.footerLinks}>
              <button type="button" onClick={() => setLegalModal("terms")}>{content.termsText}</button>
              <span className={styles.footerSeparator}>•</span>
              <button type="button" onClick={() => setLegalModal("privacy")}>{content.privacyText}</button>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
