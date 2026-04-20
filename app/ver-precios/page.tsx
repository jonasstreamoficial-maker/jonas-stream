import Link from "next/link";

const planes = [
  {
    nombre: "NETFLIX PREMIUM",
    precio: "S/ 18",
    detalle: "Pantalla privada o compartida según disponibilidad.",
    color: "netflix",
  },
  {
    nombre: "DISNEY+ PREMIUM",
    precio: "S/ 15",
    detalle: "Contenido premium con excelente estabilidad.",
    color: "disney",
  },
  {
    nombre: "SPOTIFY PREMIUM",
    precio: "S/ 10",
    detalle: "Música sin anuncios y acceso inmediato.",
    color: "spotify",
  },
  {
    nombre: "YOUTUBE PREMIUM",
    precio: "S/ 12",
    detalle: "Sin anuncios, reproducción en segundo plano.",
    color: "youtube",
  },
  {
    nombre: "MAX PREMIUM",
    precio: "S/ 16",
    detalle: "Series y películas premium con gran catálogo.",
    color: "max",
  },
  {
    nombre: "CRUNCHYROLL",
    precio: "S/ 12",
    detalle: "Anime premium para clientes exigentes.",
    color: "crunchy",
  },
];

export default function VerPreciosPage() {
  return (
    <main className="pricing-page">
      <div className="pricing-bg" />

      <div className="container pricing-wrap">
        <div className="pricing-topbar">
          <div className="pricing-brand">
            <span className="pricing-kicker">Lista oficial</span>
            <h1>VER PRECIOS</h1>
            <p>
              Explora nuestras plataformas disponibles y elige la opción ideal
              para ti o para tu negocio como revendedor.
            </p>
          </div>

          <div className="pricing-actions">
            <Link href="/" className="pricing-btn pricing-btn-secondary">
              VOLVER AL INICIO
            </Link>

            <a
              href="https://wa.me/51900557949"
              target="_blank"
              rel="noopener noreferrer"
              className="pricing-btn pricing-btn-primary"
            >
              PEDIR POR WHATSAPP
            </a>
          </div>
        </div>

        <section className="pricing-grid">
          {planes.map((plan) => (
            <article key={plan.nombre} className={`price-card ${plan.color}`}>
              <div className="price-card-glow" />
              <span className="price-badge">Disponible</span>

              <h2>{plan.nombre}</h2>

              <div className="price-value">{plan.precio}</div>

              <p>{plan.detalle}</p>

              <a
                href="https://wa.me/51900557949"
                target="_blank"
                rel="noopener noreferrer"
                className="price-link"
              >
                SOLICITAR AHORA
              </a>
            </article>
          ))}
        </section>

        <section className="pricing-note-box">
          <div className="pricing-note">
            <h3>IMPORTANTE</h3>
            <p>
              Los precios pueden variar según disponibilidad, tipo de acceso y
              modalidad del servicio. Para atención inmediata, pedidos o compra
              por cantidad, contáctanos directamente por WhatsApp.
            </p>
          </div>

          <div className="pricing-note">
            <h3>BENEFICIOS</h3>
            <p>
              Atención rápida, soporte confiable, entrega segura y opciones para
              clientes finales o revendedores que buscan crecer con Jonas
              Stream.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}