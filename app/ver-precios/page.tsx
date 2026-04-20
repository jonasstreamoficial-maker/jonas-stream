import Link from "next/link";

const planes = [
  {
    nombre: "NETFLIX PREMIUM",
    precio: "S/ 18",
    detalle: "Pantalla privada o compartida según disponibilidad.",
    color: "netflix",
    categoria: "Streaming",
    estado: "Más vendido",
    destacado: true,
    beneficios: [
      "Acceso rápido",
      "Buena estabilidad",
      "Ideal para uso personal",
    ],
  },
  {
    nombre: "DISNEY+ PREMIUM",
    precio: "S/ 15",
    detalle: "Contenido premium con excelente estabilidad.",
    color: "disney",
    categoria: "Streaming",
    estado: "Disponible",
    destacado: false,
    beneficios: [
      "Series y películas",
      "Muy buena calidad",
      "Activación segura",
    ],
  },
  {
    nombre: "SPOTIFY PREMIUM",
    precio: "S/ 10",
    detalle: "Música sin anuncios y acceso inmediato.",
    color: "spotify",
    categoria: "Música",
    estado: "Disponible",
    destacado: false,
    beneficios: [
      "Sin anuncios",
      "Escucha offline",
      "Entrega inmediata",
    ],
  },
  {
    nombre: "YOUTUBE PREMIUM",
    precio: "S/ 12",
    detalle: "Sin anuncios y reproducción en segundo plano.",
    color: "youtube",
    categoria: "Video",
    estado: "Top elección",
    destacado: false,
    beneficios: [
      "Segundo plano",
      "Menos interrupciones",
      "Muy solicitado",
    ],
  },
  {
    nombre: "MAX PREMIUM",
    precio: "S/ 16",
    detalle: "Series y películas premium con gran catálogo.",
    color: "max",
    categoria: "Streaming",
    estado: "Disponible",
    destacado: false,
    beneficios: [
      "Estrenos y series",
      "Buen catálogo",
      "Alta demanda",
    ],
  },
  {
    nombre: "CRUNCHYROLL PREMIUM",
    precio: "S/ 12",
    detalle: "Anime premium para clientes exigentes.",
    color: "crunchy",
    categoria: "Anime",
    estado: "Disponible",
    destacado: false,
    beneficios: [
      "Anime premium",
      "Muy solicitado",
      "Buena experiencia",
    ],
  },
];

export default function VerPreciosPage() {
  return (
    <>
      <main className="pricing-page">
        <div className="pricing-orb pricing-orb-1" />
        <div className="pricing-orb pricing-orb-2" />
        <div className="pricing-grid-lines" />

        <div className="pricing-wrap">
          <section className="pricing-hero">
            <div className="pricing-hero-left">
              <span className="pricing-kicker">LISTA OFICIAL DE PRECIOS</span>

              <h1>
                ELIGE TU
                <span> PLATAFORMA IDEAL</span>
              </h1>

              <p className="pricing-lead">
                Precios accesibles, activación rápida y atención confiable para
                clientes finales y revendedores. Todo en una presentación más
                clara, profesional y premium.
              </p>

              <div className="pricing-mini-stats">
                <div className="mini-stat">
                  <strong>+2K</strong>
                  <span>Clientes</span>
                </div>

                <div className="mini-stat">
                  <strong>24/7</strong>
                  <span>Soporte</span>
                </div>

                <div className="mini-stat">
                  <strong>Rápida</strong>
                  <span>Entrega</span>
                </div>
              </div>
            </div>

            <div className="pricing-hero-right">
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
          </section>

          <section className="pricing-info-strip">
            <div className="info-chip">✔ Activación rápida</div>
            <div className="info-chip">✔ Atención segura</div>
            <div className="info-chip">✔ Precios competitivos</div>
            <div className="info-chip">✔ Opción para revendedores</div>
          </section>

          <section className="pricing-grid">
            {planes.map((plan) => (
              <article
                key={plan.nombre}
                className={`price-card ${plan.color} ${
                  plan.destacado ? "featured" : ""
                }`}
              >
                <div className="price-card-glow" />

                <div className="price-card-top">
                  <span className={`price-badge ${plan.destacado ? "hot" : ""}`}>
                    {plan.estado}
                  </span>

                  <span className="price-category">{plan.categoria}</span>
                </div>

                <div className="price-card-body">
                  <h2>{plan.nombre}</h2>

                  <div className="price-row">
                    <div className="price-value">{plan.precio}</div>
                    <span className="price-small">por acceso</span>
                  </div>

                  <p className="price-description">{plan.detalle}</p>

                  <ul className="price-benefits">
                    {plan.beneficios.map((beneficio) => (
                      <li key={beneficio}>{beneficio}</li>
                    ))}
                  </ul>
                </div>

                <div className="price-card-actions">
                  <a
                    href={`https://wa.me/51900557949?text=Hola,%20quiero%20pedir%20${encodeURIComponent(
                      plan.nombre
                    )}%20por%20${encodeURIComponent(plan.precio)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="price-link price-link-primary"
                  >
                    SOLICITAR AHORA
                  </a>

                  <a
                    href="https://wa.me/51900557949"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="price-link price-link-secondary"
                  >
                    MÁS INFORMACIÓN
                  </a>
                </div>
              </article>
            ))}
          </section>

          <section className="pricing-bottom">
            <div className="pricing-note-box">
              <div className="pricing-note">
                <h3>IMPORTANTE</h3>
                <p>
                  Los precios pueden variar según disponibilidad, tipo de acceso,
                  stock y modalidad del servicio. Algunos productos pueden
                  manejar acceso privado o compartido.
                </p>
              </div>

              <div className="pricing-note">
                <h3>BENEFICIOS</h3>
                <p>
                  Atención rápida, soporte confiable, entrega segura y opciones
                  para clientes finales o revendedores que buscan crecer con
                  Jonas Stream.
                </p>
              </div>

              <div className="pricing-note">
                <h3>PEDIDOS MAYORES</h3>
                <p>
                  Si deseas comprar por cantidad o trabajar como socio o
                  revendedor, puedes solicitar atención personalizada por
                  WhatsApp.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        .pricing-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at top left, rgba(1, 231, 239, 0.16), transparent 26%),
            radial-gradient(circle at bottom right, rgba(1, 139, 144, 0.18), transparent 30%),
            linear-gradient(180deg, #000000 0%, #031316 45%, #071b1e 100%);
          color: #ecffff;
        }

        .pricing-wrap {
          position: relative;
          z-index: 2;
          width: min(1240px, calc(100% - 32px));
          margin: 0 auto;
          padding: 48px 0 70px;
        }

        .pricing-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(70px);
          pointer-events: none;
          z-index: 0;
        }

        .pricing-orb-1 {
          width: 280px;
          height: 280px;
          top: -40px;
          left: -80px;
          background: rgba(1, 231, 239, 0.12);
        }

        .pricing-orb-2 {
          width: 340px;
          height: 340px;
          right: -100px;
          bottom: 50px;
          background: rgba(1, 139, 144, 0.16);
        }

        .pricing-grid-lines {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.35), transparent 95%);
          pointer-events: none;
        }

        .pricing-hero {
          display: flex;
          justify-content: space-between;
          gap: 28px;
          align-items: flex-end;
          padding: 34px;
          border: 1px solid rgba(236, 255, 255, 0.08);
          background: rgba(3, 19, 22, 0.72);
          box-shadow:
            0 10px 35px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(18px);
          border-radius: 28px;
          margin-bottom: 24px;
        }

        .pricing-kicker {
          display: inline-flex;
          margin-bottom: 14px;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid rgba(1, 231, 239, 0.28);
          background: rgba(1, 231, 239, 0.08);
          color: #01e7ef;
          font-size: 12px;
          letter-spacing: 1.8px;
          font-weight: 700;
        }

        .pricing-hero h1 {
          margin: 0;
          font-size: clamp(2.2rem, 5vw, 4.5rem);
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .pricing-hero h1 span {
          display: block;
          color: #01e7ef;
          text-shadow: 0 0 24px rgba(1, 231, 239, 0.24);
        }

        .pricing-lead {
          max-width: 760px;
          margin-top: 18px;
          font-size: 1rem;
          line-height: 1.7;
          color: #9bc8cb;
        }

        .pricing-mini-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .mini-stat {
          min-width: 120px;
          padding: 14px 16px;
          border-radius: 18px;
          border: 1px solid rgba(236, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
        }

        .mini-stat strong {
          display: block;
          font-size: 1.05rem;
          color: #ecffff;
        }

        .mini-stat span {
          font-size: 0.88rem;
          color: #9bc8cb;
        }

        .pricing-hero-right {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 240px;
        }

        .pricing-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 54px;
          padding: 14px 20px;
          border-radius: 16px;
          text-decoration: none;
          font-weight: 800;
          letter-spacing: 0.4px;
          transition: 0.25s ease;
        }

        .pricing-btn-primary {
          background: linear-gradient(135deg, #01e7ef, #00fbff);
          color: #031316;
          box-shadow: 0 0 24px rgba(1, 231, 239, 0.22);
        }

        .pricing-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 34px rgba(1, 231, 239, 0.34);
        }

        .pricing-btn-secondary {
          border: 1px solid rgba(236, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: #ecffff;
        }

        .pricing-btn-secondary:hover {
          transform: translateY(-2px);
          border-color: rgba(1, 231, 239, 0.28);
          color: #01e7ef;
        }

        .pricing-info-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 28px;
        }

        .info-chip {
          padding: 12px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(236, 255, 255, 0.06);
          color: #c8eff1;
          font-size: 0.92rem;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .price-card {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          padding: 22px;
          border: 1px solid rgba(236, 255, 255, 0.08);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)),
            rgba(3, 19, 22, 0.86);
          box-shadow:
            0 16px 40px rgba(0, 0, 0, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
        }

        .price-card:hover {
          transform: translateY(-8px);
          border-color: rgba(1, 231, 239, 0.22);
          box-shadow:
            0 22px 50px rgba(0, 0, 0, 0.4),
            0 0 28px rgba(1, 231, 239, 0.08);
        }

        .price-card.featured {
          border-color: rgba(1, 231, 239, 0.32);
          box-shadow:
            0 22px 50px rgba(0, 0, 0, 0.42),
            0 0 34px rgba(1, 231, 239, 0.14);
        }

        .price-card-glow {
          position: absolute;
          inset: auto -40px -50px auto;
          width: 160px;
          height: 160px;
          border-radius: 999px;
          filter: blur(40px);
          opacity: 0.22;
          pointer-events: none;
        }

        .netflix .price-card-glow {
          background: #ff2d2d;
        }

        .disney .price-card-glow {
          background: #3a86ff;
        }

        .spotify .price-card-glow {
          background: #1ed760;
        }

        .youtube .price-card-glow {
          background: #ff3b30;
        }

        .max .price-card-glow {
          background: #7c4dff;
        }

        .crunchy .price-card-glow {
          background: #ff7a00;
        }

        .price-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
        }

        .price-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(236, 255, 255, 0.06);
          color: #ecffff;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .price-badge.hot {
          background: rgba(1, 231, 239, 0.12);
          color: #01e7ef;
          border-color: rgba(1, 231, 239, 0.24);
        }

        .price-category {
          color: #9bc8cb;
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .price-card h2 {
          margin: 0 0 12px;
          font-size: 1.35rem;
          line-height: 1.2;
          font-weight: 900;
          color: #ecffff;
        }

        .price-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin-bottom: 14px;
        }

        .price-value {
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1;
          color: #01e7ef;
          text-shadow: 0 0 22px rgba(1, 231, 239, 0.18);
        }

        .price-small {
          font-size: 0.88rem;
          color: #9bc8cb;
          margin-bottom: 4px;
        }

        .price-description {
          margin: 0 0 16px;
          color: #b8dfe1;
          line-height: 1.65;
          min-height: 76px;
        }

        .price-benefits {
          list-style: none;
          padding: 0;
          margin: 0 0 22px;
          display: grid;
          gap: 10px;
        }

        .price-benefits li {
          position: relative;
          padding-left: 18px;
          color: #d8f4f6;
          font-size: 0.95rem;
        }

        .price-benefits li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 9px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #01e7ef;
          box-shadow: 0 0 14px rgba(1, 231, 239, 0.45);
        }

        .price-card-actions {
          display: grid;
          gap: 10px;
        }

        .price-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          border-radius: 16px;
          text-decoration: none;
          font-weight: 800;
          transition: 0.25s ease;
        }

        .price-link-primary {
          background: linear-gradient(135deg, #01e7ef, #00fbff);
          color: #031316;
        }

        .price-link-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 24px rgba(1, 231, 239, 0.28);
        }

        .price-link-secondary {
          border: 1px solid rgba(236, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: #ecffff;
        }

        .price-link-secondary:hover {
          transform: translateY(-2px);
          border-color: rgba(1, 231, 239, 0.24);
          color: #01e7ef;
        }

        .pricing-bottom {
          margin-top: 30px;
        }

        .pricing-note-box {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .pricing-note {
          padding: 22px;
          border-radius: 22px;
          border: 1px solid rgba(236, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
        }

        .pricing-note h3 {
          margin: 0 0 10px;
          font-size: 1rem;
          color: #01e7ef;
        }

        .pricing-note p {
          margin: 0;
          color: #b8dfe1;
          line-height: 1.7;
        }

        @media (max-width: 1100px) {
          .pricing-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pricing-note-box {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 860px) {
          .pricing-hero {
            flex-direction: column;
            align-items: stretch;
          }

          .pricing-hero-right {
            min-width: unset;
            width: 100%;
          }
        }

        @media (max-width: 720px) {
          .pricing-wrap {
            width: min(100% - 20px, 1240px);
            padding: 22px 0 50px;
          }

          .pricing-hero {
            padding: 22px;
            border-radius: 22px;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .price-description {
            min-height: auto;
          }

          .pricing-hero h1 {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </>
  );
}