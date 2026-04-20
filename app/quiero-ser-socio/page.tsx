import Link from "next/link";
import styles from "./page.module.css";

const beneficios = [
  "Publicidad ilimitada",
  "Soporte rápido",
  "Ganancias por reventa",
  "Activación inmediata",
  "Marca profesional",
  "Escala tu negocio",
];

export default function QuieroSerSocioPage() {
  return (
    <main className={styles.page}>
      <div className={styles.bgGlow1}></div>
      <div className={styles.bgGlow2}></div>

      <section className={styles.wrap}>
        <div className={styles.banner}>
          <span className={styles.badge}>PROMO ACTIVA</span>
          <h2>ACCEDE HOY AL GRUPO PRIVADO DESDE S/ 8</h2>
          <p>Cupos limitados para nuevos socios revendedores.</p>

          <a
            href="https://wa.me/51900557949"
            target="_blank"
            className={styles.btnPrimary}
          >
            QUIERO INGRESAR
          </a>
        </div>

        <section className={styles.hero}>
          <div>
            <span className={styles.kicker}>OPORTUNIDAD REAL</span>

            <h1>
              QUIERO SER <span>SOCIO</span>
            </h1>

            <p>
              Únete a Jonas Stream y empieza a generar ingresos revendiendo
              plataformas premium con soporte, imagen profesional y acceso rápido.
            </p>

            <div className={styles.actions}>
              <a
                href="https://wa.me/51900557949"
                target="_blank"
                className={styles.btnPrimary}
              >
                SOLICITAR INFO
              </a>

              <Link href="/" className={styles.btnSecondary}>
                VOLVER
              </Link>
            </div>
          </div>

          <div className={styles.cardInfo}>
            <h3>¿Cómo funciona?</h3>

            <ul>
              <li>1. Solicitas ingreso</li>
              <li>2. Recibes acceso</li>
              <li>3. Empiezas a vender</li>
              <li>4. Generas ganancias</li>
            </ul>

            <strong>Ideal para emprendedores digitales</strong>
          </div>
        </section>

        <section className={styles.grid}>
          {beneficios.map((item) => (
            <div key={item} className={styles.card}>
              {item}
            </div>
          ))}
        </section>

        <section className={styles.bottom}>
          <h2>EMPIEZA HOY</h2>
          <p>Solicita información y entra al grupo de socios.</p>

          <a
            href="https://wa.me/51900557949"
            target="_blank"
            className={styles.btnPrimary}
          >
            UNIRME AHORA
          </a>
        </section>
      </section>
    </main>
  );
}