"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const PROMO_PRICE_PEN = 10;
const OLD_PRICE_PEN = 80;
const USD_RATE = 3.75; // Cambia este valor si deseas actualizar manualmente el tipo de cambio

const promoBenefits = [
  "Ingresas al grupo privado de socios revendedores.",
  "Recibes orientación para entender la dinámica del negocio.",
  "Empiezas a ofrecer plataformas premium con mejor imagen.",
  "Generas ganancias revendiendo con apoyo y respaldo.",
];

const availablePlatforms = [
  "Netflix",
  "Disney+",
  "Prime Video",
  "Max",
  "Paramount+",
  "Crunchyroll",
  "VIX",
  "IPTV",
  "Viki",
  "y más",
];

const mainBenefits = [
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

export default function QuieroSerSocioPage() {
  const [showPromo, setShowPromo] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (!showPromo) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 15 * 60;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPromo]);

  const usdPrice = useMemo(() => PROMO_PRICE_PEN / USD_RATE, []);
  const oldUsdPrice = useMemo(() => OLD_PRICE_PEN / USD_RATE, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />

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
              <div className={styles.promoPriceMain}>S/ {formatMoney(PROMO_PRICE_PEN)}</div>
              <div className={styles.promoPriceUsd}>
                ≈ USD {formatMoney(usdPrice)}
              </div>
              <div className={styles.promoOldPrice}>
                Antes: S/ {formatMoney(OLD_PRICE_PEN)} · USD {formatMoney(oldUsdPrice)}
              </div>
            </div>

            <div className={styles.countdownWrap}>
              <span className={styles.countdownLabel}>La promo termina en</span>
              <div className={styles.countdown}>
                <div className={styles.countBox}>
                  <strong>{minutes}</strong>
                  <span>MIN</span>
                </div>
                <div className={styles.countSeparator}>:</div>
                <div className={styles.countBox}>
                  <strong>{seconds}</strong>
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
                href="https://wa.me/51900557949"
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
              Precio en dólares calculado con tipo de cambio manual: 1 USD = S/ {USD_RATE}
            </p>
          </div>
        </div>
      )}

      <section className={styles.hero}>
        <div className={styles.heroBadge}>NEGOCIO PARA REVENDEDORES</div>

        <h1 className={styles.heroTitle}>
          CONVIÉRTETE EN SOCIO Y EMPIEZA A REVENDER CON
          <span> JONAS STREAM</span>
        </h1>

        <p className={styles.heroText}>
          ¿Te gustaría generar ingresos vendiendo las plataformas más buscadas del mercado?
          Soy <strong>JONAS</strong>, administrador y proveedor autorizado. Te acompañaré
          paso a paso para que empieces sin complicaciones y veas resultados rápido.
        </p>

        <div className={styles.heroActions}>
          <a
            href="https://wa.me/51900557949"
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
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>PLATAFORMAS DISPONIBLES</span>
          <h2 className={styles.sectionTitle}>Lo que puedes ofrecer desde el inicio</h2>
        </div>

        <div className={styles.platformsGrid}>
          {availablePlatforms.map((platform) => (
            <div key={platform} className={styles.platformCard}>
              {platform}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>CÓMO GANAS DINERO</span>
          <h2 className={styles.sectionTitle}>Ejemplo sencillo de rentabilidad</h2>
        </div>

        <div className={styles.exampleCard}>
          <div className={styles.exampleIntro}>
            Así funciona el negocio: compras al por mayor y vendes por perfil con buena ganancia.
          </div>

          <div className={styles.exampleSteps}>
            <div className={styles.stepItem}>
              <span>1</span>
              <p>Compras una cuenta completa de <strong>Prime Video</strong> por <strong>S/12.00</strong> (incluye 6 perfiles).</p>
            </div>
            <div className={styles.stepItem}>
              <span>2</span>
              <p>Vendes cada perfil a <strong>S/8.00</strong>.</p>
            </div>
            <div className={styles.stepItem}>
              <span>3</span>
              <p>Total vendido: <strong>S/48.00</strong>.</p>
            </div>
            <div className={styles.stepItem}>
              <span>4</span>
              <p>Restando tu inversión de <strong>S/12.00</strong>, obtienes una <strong>ganancia neta de S/36.00</strong>.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>BENEFICIOS</span>
          <h2 className={styles.sectionTitle}>Lo que recibes al entrar</h2>
        </div>

        <div className={styles.benefitsGrid}>
          {mainBenefits.map((benefit) => (
            <article key={benefit.number} className={styles.benefitCard}>
              <div className={styles.benefitNumber}>{benefit.number}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.doubleGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoKicker}>PRIMER BENEFICIO</span>
            <h3>Comunidad pública exclusiva</h3>
            <p>
              Únete gratis a nuestra comunidad pública exclusiva para empezar a conectar con el entorno del negocio.
            </p>
            <a
              href="https://chat.whatsapp.com/Km1vlhsOpCJ1svHl5uNdig"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              IR AL GRUPO OFICIAL
            </a>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoKicker}>SEGUNDO BENEFICIO</span>
            <h3>Catálogo + control profesional</h3>
            <p>
              Accede a un catálogo exclusivo con excelentes precios, actualizado constantemente, y una plantilla de Excel para organizar tus ventas.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.pricingSection}>
        <div className={styles.pricingCard}>
          <span className={styles.sectionKicker}>CÓMO SER SOCIO</span>
          <h2 className={styles.sectionTitle}>Ingresa hoy con promoción activa</h2>

          <div className={styles.pricingMain}>
            <div className={styles.priceNow}>S/ {formatMoney(PROMO_PRICE_PEN)}</div>
            <div className={styles.priceUsd}>USD {formatMoney(usdPrice)}</div>
            <div className={styles.priceBefore}>Antes: S/ {formatMoney(OLD_PRICE_PEN)}</div>
          </div>

          <div className={styles.pricingList}>
            <div className={styles.pricingItem}>✅ Catálogo exclusivo con precios rebajados</div>
            <div className={styles.pricingItem}>✅ Promociones más accesibles que al público general</div>
            <div className={styles.pricingItem}>✅ Comunidad privada de socios</div>
            <div className={styles.pricingItem}>✅ Publicidad editable en Canva PRO</div>
            <div className={styles.pricingItem}>✅ Oportunidad de generar ingresos desde casa</div>
          </div>

          <div className={styles.pricingActions}>
            <Link href="/ver-precios" className={styles.heroBtnSecondary}>
              VER PRECIOS EXCLUSIVOS
            </Link>

            <a
              href="https://wa.me/51900557949"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroBtnPrimary}
            >
              ACTIVAR MI ACCESO
            </a>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>AFILIACIÓN</span>
          <h2 className={styles.sectionTitle}>También puedes ganar recomendando</h2>
        </div>

        <div className={styles.affiliatesCard}>
          <p>
            Recomiendas la comunidad a un amigo o familiar y tú decides cuánto cobrarle por inscripción.
            Puede ser <strong>S/10, S/20 o S/30</strong>.
          </p>
          <p>
            Nosotros solo cobramos <strong>S/5</strong> por activarlo y esa persona recibe los mismos beneficios:
            catálogo exclusivo, promociones, comunidad privada y material publicitario.
          </p>
          <p className={styles.affiliatesHighlight}>
            Hoy puedes empezar a ganar vendiendo y también recomendando.
          </p>
        </div>
      </section>
    </div>
  );
}