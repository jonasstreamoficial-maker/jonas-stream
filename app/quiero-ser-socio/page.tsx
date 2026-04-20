"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const beneficios = [
  {
    numero: "01",
    titulo: "Publicidad ilimitada",
    texto:
      "Promociona tus servicios con una imagen más profesional y una presencia digital mucho más fuerte.",
  },
  {
    numero: "02",
    titulo: "Soporte rápido",
    texto:
      "Recibe ayuda ágil para activaciones, dudas y acompañamiento durante tu proceso de venta.",
  },
  {
    numero: "03",
    titulo: "Ganancias por reventa",
    texto:
      "Accede a precios competitivos para generar ingresos revendiendo plataformas premium.",
  },
  {
    numero: "04",
    titulo: "Activación inmediata",
    texto:
      "Empieza rápido y aprovecha el impulso para captar clientes antes que otros.",
  },
  {
    numero: "05",
    titulo: "Imagen profesional",
    texto:
      "Forma parte de una propuesta moderna, seria y llamativa para vender con más confianza.",
  },
  {
    numero: "06",
    titulo: "Escala tu negocio",
    texto:
      "Ideal para emprendedores que quieren crecer, revender más y construir ingresos constantes.",
  },
];

const pasos = [
  {
    numero: "01",
    titulo: "Solicita tu ingreso",
    texto:
      "Escríbenos por WhatsApp y recibe todos los detalles sobre el acceso al grupo privado.",
  },
  {
    numero: "02",
    titulo: "Activa tu acceso",
    texto:
      "Se valida tu ingreso y obtienes acceso a la comunidad privada de socios revendedores.",
  },
  {
    numero: "03",
    titulo: "Empieza a vender",
    texto:
      "Comienza a revender plataformas premium con apoyo, estructura e imagen profesional.",
  },
];

const stats = [
  { valor: "+2K", label: "Clientes alcanzados" },
  { valor: "24/7", label: "Soporte rápido" },
  { valor: "S/ 8", label: "Ingreso promocional" },
  { valor: "TOP", label: "Modelo de reventa" },
];

const promoBenefits = [
  "Acceso rápido al grupo privado",
  "Ideal para emprendedores digitales",
  "Oferta especial por tiempo limitado",
];

export default function QuieroSerSocioPage() {
  const [mostrarPromo, setMostrarPromo] = useState(false);

  useEffect(() => {
    const promoVista = localStorage.getItem("jonas-stream-promo-socio-vista");

    if (!promoVista) {
      setMostrarPromo(true);
    }
  }, []);

  useEffect(() => {
    if (mostrarPromo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mostrarPromo]);

  const cerrarPromo = () => {
    localStorage.setItem("jonas-stream-promo-socio-vista", "true");
    setMostrarPromo(false);
  };

  return (
    <main className={styles.page}>
      {mostrarPromo && (
        <div className={styles.promoOverlay}>
          <div className={styles.promoBackdrop} onClick={cerrarPromo} />

          <div
            className={styles.promoModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-title"
          >
            <button
              type="button"
              className={styles.promoClose}
              onClick={cerrarPromo}
              aria-label="Cerrar promoción"
            >
              ×
            </button>

            <div className={styles.promoTopLine} />

            <span className={styles.promoBadge}>PROMOCIÓN EXCLUSIVA</span>

            <p className={styles.promoMiniText}>
              PRECIO REGULAR <span>S/ 15</span> · HOY <strong>S/ 8</strong>
            </p>

            <h2 id="promo-title" className={styles.promoTitle}>
              ACCEDE HOY AL <span>GRUPO PRIVADO</span> DE SOCIOS
            </h2>

            <p className={styles.promoText}>
              Empieza con una propuesta más profesional, soporte rápido,
              orientación para revender y una oportunidad real para generar
              ingresos desde el primer paso.
            </p>

            <div className={styles.promoBenefits}>
              {promoBenefits.map((item) => (
                <div key={item} className={styles.promoBenefit}>
                  <span />
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <div className={styles.promoActions}>
              <a
                href="https://wa.me/51900557949"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnPrimary}
              >
                QUIERO INGRESAR AHORA
              </a>

              <button
                type="button"
                className={styles.btnGhost}
                onClick={cerrarPromo}
              >
                CERRAR Y SEGUIR VIENDO
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.noise} />
      <div className={styles.gridLines} />
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.bgGlow3} />

      <section className={styles.wrap}>
        <section className={styles.banner}>
          <div className={styles.bannerGlow} />

          <span className={styles.badge}>PROMO ACTIVA</span>

          <h2>INGRESA HOY AL GRUPO PRIVADO DESDE S/ 8</h2>

          <p>
            Cupos limitados para nuevos socios revendedores que quieran empezar
            con una propuesta más seria, profesional y rentable.
          </p>

          <div className={styles.bannerActions}>
            <a
              href="https://wa.me/51900557949"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              QUIERO INGRESAR AHORA
            </a>

            <Link href="/" className={styles.btnSecondary}>
              VOLVER AL INICIO
            </Link>
          </div>
        </section>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>PROGRAMA PREMIUM DE SOCIOS</span>

            <h1>
              CONVIÉRTETE EN <span>SOCIO</span> Y EMPIEZA A REVENDER CON
              <br />
              JONAS STREAM
            </h1>

            <div className={styles.heroLine} />

            <p className={styles.heroText}>
              Únete a una oportunidad real para revender plataformas premium
              con soporte rápido, acceso al grupo privado, mejor presencia
              comercial y una estructura pensada para crecer.
            </p>

            <div className={styles.heroPills}>
              <span>Ingreso rápido</span>
              <span>Grupo privado</span>
              <span>Soporte</span>
              <span>Reventa premium</span>
            </div>

            <div className={styles.actions}>
              <a
                href="https://wa.me/51900557949"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnPrimary}
              >
                SOLICITAR INFORMACIÓN
              </a>

              <Link href="/" className={styles.btnSecondary}>
                VOLVER AL INICIO
              </Link>
            </div>

            <div className={styles.stats}>
              {stats.map((item) => (
                <div key={item.label} className={styles.statCard}>
                  <strong>{item.valor}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.cardInfo}>
            <div className={styles.cardInfoTop}>
              <span className={styles.miniTag}>ACCESO RÁPIDO</span>
              <h3>¿Cómo funciona el negocio?</h3>
            </div>

            <ul className={styles.featureList}>
              <li>
                <span />
                <p>Ingresas al grupo privado de socios revendedores.</p>
              </li>
              <li>
                <span />
                <p>Recibes orientación para entender la dinámica del negocio.</p>
              </li>
              <li>
                <span />
                <p>Empiezas a ofrecer plataformas premium con mejor imagen.</p>
              </li>
              <li>
                <span />
                <p>Generas ganancias revendiendo con apoyo y respaldo.</p>
              </li>
            </ul>

            <div className={styles.infoBox}>
              <small>OFERTA ESPECIAL</small>
              <strong>Accede hoy desde S/ 8</strong>
              <p>Promoción sujeta a disponibilidad de cupos.</p>
            </div>
          </div>
        </section>

        <section className={styles.benefitsSection}>
          <div className={styles.sectionHead}>
            <span>BENEFICIOS PREMIUM</span>
            <h2>Todo lo que obtienes al ingresar como socio</h2>
            <p>
              Una propuesta fuerte transmite valor, confianza, orden y una
              imagen que ayuda a vender mejor desde el primer contacto.
            </p>
          </div>

          <div className={styles.grid}>
            {beneficios.map((item) => (
              <article key={item.numero} className={styles.card}>
                <div className={styles.cardNumber}>{item.numero}</div>
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.stepsSection}>
          <div className={styles.sectionHead}>
            <span>CÓMO FUNCIONA</span>
            <h2>Empieza en pocos pasos</h2>
            <p>
              Un proceso simple, rápido y pensado para que puedas comenzar sin
              complicarte.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {pasos.map((paso) => (
              <article key={paso.numero} className={styles.stepCard}>
                <div className={styles.stepNumber}>{paso.numero}</div>
                <h3>{paso.titulo}</h3>
                <p>{paso.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.bottom}>
          <div className={styles.bottomGlow} />

          <span className={styles.bottomTag}>JONAS STREAM | SOCIOS</span>

          <h2>EMPIEZA HOY Y ENTRA AL GRUPO PRIVADO</h2>

          <p>
            Da el siguiente paso y forma parte de una propuesta premium para
            revender plataformas con mejor soporte, mayor presencia y una
            imagen mucho más profesional.
          </p>

          <div className={styles.bottomPriceBox}>
            <small>INGRESO PROMOCIONAL</small>
            <strong>S/ 8</strong>
            <span>Oferta por tiempo limitado</span>
          </div>

          <div className={styles.bottomActions}>
            <a
              href="https://wa.me/51900557949"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              UNIRME AHORA
            </a>

            <Link href="/" className={styles.btnSecondary}>
              VOLVER
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}