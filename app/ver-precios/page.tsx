import Link from "next/link";
import styles from "./page.module.css";

const planes = [
  { nombre: "NETFLIX PREMIUM", precio: "S/18", color: "netflix" },
  { nombre: "DISNEY+ PREMIUM", precio: "S/15", color: "disney" },
  { nombre: "SPOTIFY PREMIUM", precio: "S/10", color: "spotify" },
  { nombre: "YOUTUBE PREMIUM", precio: "S/12", color: "youtube" },
  { nombre: "MAX PREMIUM", precio: "S/16", color: "max" },
  { nombre: "CRUNCHYROLL", precio: "S/12", color: "crunchy" },
];

export default function VerPreciosPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>

      <section className={styles.wrap}>
        <div className={styles.top}>
          <div>
            <span className={styles.badge}>LISTA OFICIAL</span>
            <h1>VER PRECIOS</h1>
            <p>
              Plataformas premium con activación rápida, soporte seguro y precios
              accesibles.
            </p>
          </div>

          <div className={styles.actions}>
            <Link href="/" className={styles.btn2}>
              VOLVER
            </Link>

            <a
              href="https://wa.me/51900557949"
              target="_blank"
              className={styles.btn1}
            >
              PEDIR AHORA
            </a>
          </div>
        </div>

        <section className={styles.grid}>
          {planes.map((plan) => (
            <article
              key={plan.nombre}
              className={`${styles.card} ${styles[plan.color]}`}
            >
              <span className={styles.estado}>Disponible</span>

              <h2>{plan.nombre}</h2>

              <div className={styles.price}>{plan.precio}</div>

              <p>Entrega rápida y acceso premium.</p>

              <a
                href={`https://wa.me/51900557949?text=Hola quiero ${plan.nombre}`}
                target="_blank"
                className={styles.buy}
              >
                SOLICITAR
              </a>
            </article>
          ))}
        </section>

        <section className={styles.bottom}>
          <h3>IMPORTANTE</h3>
          <p>
            Los precios pueden variar según disponibilidad o tipo de acceso.
          </p>
        </section>
      </section>
    </main>
  );
}