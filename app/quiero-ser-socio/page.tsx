"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const WHATSAPP_NUMBER = "51900557949";
const PRICE_PEN = 10;
const OLD_PRICE_PEN = 80;
const USD_RATE = 3.75;

const promoBenefits = [
  "Ingresas al grupo privado de socios revendedores.",
  "Recibes orientación para entender la dinámica del negocio.",
  "Empiezas a ofrecer plataformas premium con mejor imagen.",
  "Generas ganancias revendiendo con apoyo y respaldo.",
];

const platformItems = [
  { name: "Netflix", className: "netflix" },
  { name: "Disney+", className: "disney" },
  { name: "Prime Video", className: "prime" },
  { name: "Max", className: "max" },
  { name: "Paramount+", className: "paramount" },
  { name: "Crunchyroll", className: "crunchy" },
  { name: "VIX", className: "vix" },
  { name: "IPTV", className: "iptv" },
  { name: "Viki", className: "viki" },
  { name: "y más", className: "more" },
];

const benefits = [
  {
    number: "01",
    title: "Comunidad privada",
    text: "Forma parte del grupo exclusivo de socios revendedores para recibir soporte, guía y novedades del negocio.",
  },
  {
    number: "02",
    title: "Catálogo exclusivo",
    text: "Accede a precios rebajados, promociones especiales y mejores condiciones que el público general.",
  },
  {
    number: "03",
    title: "Publicidad editable",
    text: "Obtén material visual editable para publicar más profesional y vender con una mejor imagen.",
  },
  {
    number: "04",
    title: "Ganancias por reventa",
    text: "Compras a precio socio y revendes por perfil o cuenta para generar ingresos con buena rentabilidad.",
  },
  {
    number: "05",
    title: "Soporte y orientación",
    text: "No empiezas solo. Recibes acompañamiento para entender cómo funciona la dinámica de compra, venta y activación.",
  },
  {
    number: "06",
    title: "Oportunidad de afiliación",
    text: "También puedes recomendar el acceso a otros y ganar activando nuevos socios dentro de la comunidad.",
  },
];

function formatMoney(value: number) {
  return value.toFixed(2);
}

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getSecondsUntilEndOfDay() {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}

export default function QuieroSerSocioPage() {
  const [showPromo, setShowPromo] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    setSecondsLeft(getSecondsUntilEndOfDay());

    const timer = setInterval(() => {
      setSecondsLeft(getSecondsUntilEndOfDay());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    if (showPromo) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [showPromo]);

  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const usdValue = useMemo(() => PRICE_PEN / USD_RATE, []);
  const oldUsdValue = useMemo(() => OLD_PRICE_PEN / USD_RATE, []);

  const promoMessage =
    "Hola, quiero aprovechar la PROMOCIÓN EXCLUSIVA HOY de S/10.00 para ingresar como socio revendedor de Jonas Stream.";
  const contactMessage = "1️⃣ Quiero *Vender Plataformas de Streaming.*";
  const activateMessage =
    "Hola, quiero ACTIVAR MI ACCESO como socio en Jonas Stream y aprovechar la promoción de hoy.";
  const heroMessage =
    "Hola, quiero ser socio revendedor de Jonas Stream. Deseo más información para empezar.";

  return (
    <div className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />

      <div className={styles.sideBrand}>JONAS STREAM</div>
      <div className={`${styles.sideBrand} ${styles.sideBrandRight}`}>JONAS STREAM</div>

      {showPromo && (
        <div className={styles.promoOverlay}>
          <div className={styles.promoBackdrop} onClick={() => setShowPromo(false)} />

          <div className={styles.promoModal}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setShowPromo(false)}
              aria-label="Cerrar promoción"
            >
              ×
            </button>

            <div className={styles.promoBadge}>PROMOCIÓN EXCLUSIVA</div>

            <h2 className={styles.promoTitle}>PROMOCIÓN EXCLUSIVA HOY</h2>

            <div className={styles.promoPriceBox}>
              <div className={styles.promoPriceMain}>S/ {formatMoney(PRICE_PEN)}</div>
              <div className={styles.promoPriceUsd}>USD {formatMoney(usdValue)}</div>
              <div className={styles.promoOldPrice}>
                Antes: S/ {formatMoney(OLD_PRICE_PEN)} · USD {formatMoney(oldUsdValue)}
              </div>
            </div>

            <div className={styles.countdownWrap}>
              <span className={styles.countdownLabel}>Tiempo restante para que termine el día</span>

              <div className={styles.countdown}>
                <div className={styles.countBox}>
                  <strong>{String(days).padStart(2, "0")}</strong>
                  <span>DÍAS</span>
                </div>

                <div className={styles.countBox}>
                  <strong>{String(hours).padStart(2, "0")}</strong>
                  <span>HORAS</span>
                </div>

                <div className={styles.countBox}>
                  <strong>{String(minutes).padStart(2, "0")}</strong>
                  <span>MIN</span>
                </div>

                <div className={styles.countBox}>
                  <strong>{String(seconds).padStart(2, "0")}</strong>
                  <span>SEG</span>
                </div>
              </div>
            </div>

            <div className={styles.promoBenefits}>
              {promoBenefits.map((item) => (
                <div key={item} className={styles.promoBenefit}>
                  <span className={styles.dot} />
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <div className={styles.promoActions}>
              <a
                href={buildWhatsAppLink(promoMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryAction}
              >
                QUIERO APROVECHAR LA PROMO
              </a>

              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => setShowPromo(false)}
              >
                CERRAR Y SEGUIR VIENDO
              </button>
            </div>

            <p className={styles.rateNote}>
              Tipo de cambio manual actual: 1 USD = S/ {USD_RATE}
            </p>
          </div>
        </div>
      )}

      <header className={styles.topbarWrap}>
        <div className={styles.topbar}>
          <div className={styles.brandBlock}>
            <strong>JONAS STREAM</strong>
            <span>PLATAFORMA OFICIAL</span>
          </div>

          <div className={styles.topActions}>
            <Link href="/ver-precios" className={styles.topLinkPrimary}>
              VER PRECIOS
            </Link>

            <a
              href={buildWhatsAppLink(contactMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topLink}
            >
              CONTÁCTANOS
            </a>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>NEGOCIO PARA REVENDEDORES</div>

          <h1 className={styles.heroTitle}>
            CONVIÉRTETE EN SOCIO Y EMPIEZA A REVENDER CON
            <span> JONAS STREAM</span>
          </h1>

          <p className={styles.heroText}>
            ¿Te gustaría generar ingresos vendiendo las plataformas más buscadas del mercado?
            Soy <strong> JONAS</strong>, administrador y proveedor autorizado. Te acompañaré paso
            a paso para que empieces sin complicaciones y veas resultados rápido.
          </p>

          <div className={styles.heroActions}>
            <a
              href={buildWhatsAppLink(heroMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroBtnPrimary}
            >
              QUIERO SER SOCIO
            </a>

            <Link href="/ver-precios" className={styles.heroBtnSecondary}>
              VER PRECIOS
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>PLATAFORMAS DISPONIBLES</span>
            <h2 className={styles.sectionTitle}>Lo que puedes ofrecer desde el inicio</h2>
          </div>

          <div className={styles.platformsGrid}>
            {platformItems.map((platform) => (
              <div
                key={platform.name}
                className={`${styles.platformCard} ${styles[platform.className]}`}
              >
                {platform.name}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>CÓMO GANAS DINERO</span>
            <h2 className={styles.sectionTitle}>Ejemplo sencillo de rentabilidad</h2>
          </div>

          <div className={styles.exampleHorizontal}>
            <div className={styles.exampleLeft}>
              <p className={styles.exampleLead}>
                Así funciona el negocio: compras al por mayor y vendes por perfil con buena ganancia.
              </p>

              <div className={styles.exampleProfitBox}>
                <span className={styles.exampleProfitLabel}>GANANCIA NETA ESTIMADA</span>
                <strong>S/36.00</strong>
                <small>Ejemplo con Prime Video</small>
              </div>
            </div>

            <div className={styles.exampleRight}>
              <div className={styles.stepItem}>
                <span>1</span>
                <p>
                  Compras una cuenta completa de <strong>Prime Video</strong> por{" "}
                  <strong>S/12.00</strong> (incluye 6 perfiles).
                </p>
              </div>

              <div className={styles.stepItem}>
                <span>2</span>
                <p>
                  Vendes cada perfil a <strong>S/8.00</strong>.
                </p>
              </div>

              <div className={styles.stepItem}>
                <span>3</span>
                <p>
                  Total vendido: <strong>S/48.00</strong>.
                </p>
              </div>

              <div className={styles.stepItem}>
                <span>4</span>
                <p>
                  Restando tu inversión de <strong>S/12.00</strong>, obtienes una{" "}
                  <strong>ganancia neta de S/36.00</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>BENEFICIOS POR EL DÍA DE HOY</span>
            <h2 className={styles.sectionTitle}>Accesos y ventajas activas para empezar hoy</h2>
          </div>

          <div className={styles.extraBenefitsUnified}>
            <article className={`${styles.infoCard} ${styles.netflixCard}`}>
              <span className={styles.infoKicker}>PRIMER BENEFICIO</span>
              <h3>Comunidad pública exclusiva</h3>
              <p>
                Únete gratis a nuestra comunidad pública exclusiva de <strong>Netflix</strong> para
                empezar a conectar con el entorno del negocio.
              </p>
              <a
                href="https://chat.whatsapp.com/Km1vlhsOpCJ1svHl5uNdig"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.netflixLink}
              >
                IR AL GRUPO OFICIAL
              </a>
            </article>

            <article className={styles.infoCard}>
              <span className={styles.infoKicker}>SEGUNDO BENEFICIO</span>
              <h3>Catálogo + control profesional</h3>
              <p>
                Accede a un catálogo exclusivo con excelentes precios, actualizado constantemente,
                y una plantilla de Excel para organizar tus ventas de forma profesional.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.benefitsSection}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>BENEFICIOS</span>
            <h2 className={styles.sectionTitle}>Lo que recibes al entrar</h2>
          </div>

          <div className={styles.benefitsGrid}>
            {benefits.map((benefit) => (
              <article key={benefit.number} className={styles.benefitCard}>
                <div className={styles.benefitNumber}>{benefit.number}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.pricingSection}>
          <div className={styles.pricingCard}>
            <div className={styles.sectionHeaderCenter}>
              <span className={styles.sectionKicker}>CÓMO SER SOCIO</span>
              <h2 className={styles.sectionTitle}>Ingresa hoy con promoción activa</h2>
            </div>

            <div className={styles.pricingMain}>
              <div className={styles.priceNow}>S/ {formatMoney(PRICE_PEN)}</div>
              <div className={styles.priceUsd}>USD {formatMoney(usdValue)}</div>
              <div className={styles.priceBefore}>Antes: S/ {formatMoney(OLD_PRICE_PEN)}</div>
              <div className={styles.rateInline}>Tipo de cambio manual: 1 USD = S/ {USD_RATE}</div>
            </div>

            <div className={styles.pricingList}>
              <div className={styles.pricingItem}>✅ Catálogo exclusivo con precios rebajados</div>
              <div className={styles.pricingItem}>
                ✅ Promociones más accesibles que al público general
              </div>
              <div className={styles.pricingItem}>✅ Comunidad privada de socios</div>
              <div className={styles.pricingItem}>✅ Publicidad editable en Canva PRO</div>
              <div className={styles.pricingItem}>
                ✅ Oportunidad de generar ingresos desde casa
              </div>
            </div>

            <div className={styles.pricingActions}>
              <Link href="/ver-precios" className={styles.heroBtnSecondary}>
                VER PRECIOS EXCLUSIVOS
              </Link>

              <a
                href={buildWhatsAppLink(activateMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.heroBtnPrimary}
              >
                ACTIVAR MI ACCESO
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}