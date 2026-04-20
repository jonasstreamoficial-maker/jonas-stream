import Link from "next/link";
import styles from "./page.module.css";

const beneficios = [
  {
    numero: "01",
    titulo: "Publicidad ilimitada",
    texto: "Promociona tus servicios con una imagen más profesional y mayor presencia digital.",
  },
  {
    numero: "02",
    titulo: "Soporte rápido",
    texto: "Recibe ayuda ágil para activaciones, dudas y acompañamiento en tu proceso de venta.",
  },
  {
    numero: "03",
    titulo: "Ganancias por reventa",
    texto: "Aprovecha precios competitivos para generar ingresos revendiendo plataformas premium.",
  },
  {
    numero: "04",
    titulo: "Activación inmediata",
    texto: "Ingreso rápido al sistema para que empieces a moverte y captar clientes cuanto antes.",
  },
  {
    numero: "05",
    titulo: "Marca profesional",
    texto: "Únete a una propuesta visual seria, moderna y llamativa para vender con más confianza.",
  },
  {
    numero: "06",
    titulo: "Escala tu negocio",
    texto: "Ideal para emprendedores que buscan crecer, revender más y construir ingresos constantes.",
  },
];

const pasos = [
  {
    numero: "01",
    titulo: "Solicita tu ingreso",
    texto: "Escríbenos por WhatsApp y recibe información completa sobre el acceso al grupo privado.",
  },
  {
    numero: "02",
    titulo: "Activa tu acceso",
    texto: "Se valida tu ingreso y obtienes acceso a la comunidad de socios revendedores.",
  },
  {
    numero: "03",
    titulo: "Empieza a vender",
    texto: "Comienza a revender plataformas premium con apoyo, estructura y una mejor imagen.",
  },
];

const stats = [
  { valor: "+2K", label: "Clientes alcanzados" },
  { valor: "24/7", label: "Soporte rápido" },
  { valor: "S/ 8", label: "Acceso promocional" },
  { valor: "TOP", label: "Modelo de reventa" },
];

export default function QuieroSerSocioPage() {
  return (
    <main className={styles.page}>
      <div className={styles.noise}></div>
      <div className={styles.gridLines}></div>
      <div className={styles.bgGlow1}></div>
      <div className={styles.bgGlow2}></div>
      <div className={styles.bgGlow3}></div>

      <section className={styles.wrap}>
        <section className={styles.banner}>
          <div className={styles.bannerGlow}></div>

          <span className={styles.badge}>PROMO ACTIVA</span>

          <h2>ACCEDE HOY AL GRUPO PRIVADO DESDE S/ 8</h2>

          <p>
            Cupos limitados para nuevos socios revendedores que quieran empezar
            con una propuesta más profesional, rápida y rentable.
          </p>

          <a
            href="https://wa.me/51900557949"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            QUIERO INGRESAR AHORA
          </a>
        </section>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>PROGRAMA PREMIUM DE SOCIOS</span>

            <h1>
              CONVIÉRTETE EN <span>SOCIO</span> DE JONAS STREAM
            </h1>

            <p className={styles.heroText}>
              Únete a una oportunidad real para revender plataformas premium con
              soporte rápido, acceso al grupo privado, presencia más profesional
              y una estructura pensada para crecer.
            </p>

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
              <h3>¿Por qué entrar ahora?</h3>
            </div>

            <ul className={styles.featureList}>
              <li>
                <span></span>
                <p>Ingreso a comunidad privada de socios revendedores</p>
              </li>
              <li>
                <span></span>
                <p>Modelo ideal para emprendedores digitales</p>
              </li>
              <li>
                <span></span>
                <p>Oportunidad de reventa con enfoque premium</p>
              </li>
              <li>
                <span></span>
                <p>Mejor presencia y propuesta para captar clientes</p>
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
              Una página de captación más seria debe comunicar valor, confianza
              y crecimiento. Aquí está el corazón de tu propuesta.
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
              Un proceso simple, directo y pensado para que puedas iniciar sin
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
          <div className={styles.bottomGlow}></div>

          <span className={styles.bottomTag}>JONAS STREAM | SOCIOS</span>
          <h2>EMPIEZA HOY Y ENTRA AL GRUPO PRIVADO</h2>
          <p>
            Da el siguiente paso y forma parte de una propuesta premium para
            revender plataformas con mayor presencia, mejor soporte y más
            impacto visual.
          </p>

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