import Link from "next/link";

const beneficios = [
  {
    icono: "🚀",
    titulo: "Publicidad ilimitada",
    texto:
      "Promociona tus ventas con una imagen más profesional y una propuesta atractiva para tus clientes.",
  },
  {
    icono: "🤖",
    titulo: "Soporte con bot y asesoría",
    texto:
      "Tendrás ayuda rápida para resolver dudas, pedidos y orientación para seguir creciendo.",
  },
  {
    icono: "💰",
    titulo: "Ganancias por reventa",
    texto:
      "Compra accesos a buen precio y genera margen revendiendo a tus propios clientes.",
  },
  {
    icono: "⚡",
    titulo: "Activación rápida",
    texto:
      "Procesos más ágiles para que puedas atender pedidos sin perder tiempo ni oportunidades.",
  },
  {
    icono: "🛡️",
    titulo: "Mayor confianza",
    texto:
      "Trabaja con una marca seria, moderna y enfocada en transmitir seguridad a los compradores.",
  },
  {
    icono: "📈",
    titulo: "Escala tu negocio",
    texto:
      "Ideal para quienes quieren comenzar vendiendo digital y luego crecer con más clientes.",
  },
];

const pagos = [
  {
    titulo: "Yape",
    texto: "Pagos rápidos y prácticos para afiliaciones o compras del servicio.",
  },
  {
    titulo: "Binance",
    texto: "Opción flexible para quienes prefieren pagos digitales o cripto.",
  },
  {
    titulo: "Transferencia",
    texto: "Método tradicional para mayor comodidad y seguridad al momento de pagar.",
  },
  {
    titulo: "Atención directa",
    texto: "Si tienes dudas sobre el pago, puedes coordinarlo por WhatsApp con asesoría.",
  },
];

export default function QuieroSerSocioPage() {
  return (
    <>
      <main className="socio-page">
        <div className="socio-bg" />

        <div className="socio-wrap">
          <section className="socio-offer-banner">
            <span className="socio-offer-badge">PROMO ESPECIAL</span>

            <div className="socio-offer-content">
              <h2>ACCEDE HOY AL GRUPO PRIVADO DESDE S/ 8</h2>
              <p>
                Aprovecha el precio oferta y comienza hoy mismo a formar parte de
                la comunidad de socios y revendedores de Jonas Stream.
              </p>
            </div>

            <a
              href="https://wa.me/51900557949?text=Hola,%20quiero%20ser%20socio%20de%20Jonas%20Stream"
              target="_blank"
              rel="noopener noreferrer"
              className="socio-offer-btn"
            >
              QUIERO INGRESAR
            </a>
          </section>

          <section className="socio-hero">
            <div className="socio-hero-left">
              <span className="socio-kicker">OPORTUNIDAD DE NEGOCIO</span>

              <h1>QUIERO SER SOCIO</h1>

              <p className="socio-lead">
                Únete a Jonas Stream y empieza a generar ingresos revendiendo
                plataformas digitales premium. Una propuesta moderna, rentable y
                pensada para personas que quieren crecer con una marca sólida.
              </p>

              <div className="socio-hero-actions">
                <a
                  href="https://wa.me/51900557949?text=Hola,%20quiero%20informaci%C3%B3n%20para%20ser%20socio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="socio-btn socio-btn-primary"
                >
                  SOLICITAR INFORMACIÓN
                </a>

                <Link href="/" className="socio-btn socio-btn-secondary">
                  VOLVER AL INICIO
                </Link>
              </div>

              <div className="socio-mini-benefits">
                <div className="socio-mini-card">
                  <span>📣</span>
                  <strong>Publicidad</strong>
                </div>

                <div className="socio-mini-card">
                  <span>🤝</span>
                  <strong>Soporte</strong>
                </div>

                <div className="socio-mini-card">
                  <span>💸</span>
                  <strong>Ganancias</strong>
                </div>
              </div>
            </div>

            <div className="socio-hero-right">
              <div className="socio-hero-box">
                <span className="socio-hero-box-badge">¿CÓMO FUNCIONA?</span>

                <h3>EMPIEZA EN POCOS PASOS</h3>

                <p>
                  Ingresas, recibes orientación, accedes a la comunidad y
                  comienzas a revender plataformas con apoyo y atención rápida.
                </p>

                <div className="ganancia-box">
                  <div className="ganancia-step">
                    <span>1</span>
                    <p>Escribes por WhatsApp y solicitas tu ingreso.</p>
                  </div>

                  <div className="ganancia-step">
                    <span>2</span>
                    <p>Recibes información, condiciones y acceso al grupo.</p>
                  </div>

                  <div className="ganancia-step">
                    <span>3</span>
                    <p>Empiezas a vender y generar ganancias con tu cartera.</p>
                  </div>
                </div>

                <div className="ganancia-final">
                  <strong>Ideal para quienes quieren emprender en digital.</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="socio-section">
            <div className="section-head">
              <span className="section-kicker">BENEFICIOS</span>
              <h2>¿POR QUÉ SER SOCIO DE JONAS STREAM?</h2>
              <p>
                Diseñado para ayudarte a vender mejor, transmitir confianza y
                empezar con una estructura más profesional desde el primer día.
              </p>
            </div>

            <div className="beneficios-grid">
              {beneficios.map((beneficio) => (
                <article key={beneficio.titulo} className="beneficio-card">
                  <div className="beneficio-icon">{beneficio.icono}</div>
                  <h3>{beneficio.titulo}</h3>
                  <p>{beneficio.texto}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="socio-section">
            <div className="section-head">
              <span className="section-kicker">AFILIACIÓN</span>
              <h2>¿QUÉ OBTIENES AL INGRESAR?</h2>
              <p>
                Una base más sólida para comenzar a revender, captar clientes y
                proyectarte con mejor imagen comercial.
              </p>
            </div>

            <div className="afiliado-box">
              <div className="afiliado-left">
                <h3>INCLUYE</h3>

                <ul className="afiliado-list">
                  <li>Acceso a grupo privado.</li>
                  <li>Orientación inicial para empezar.</li>
                  <li>Mejor propuesta para revender plataformas.</li>
                  <li>Asesoría por atención directa.</li>
                  <li>Oportunidad de escalar tu negocio digital.</li>
                </ul>
              </div>

              <div className="afiliado-right">
                <div className="afiliado-card">
                  <span className="afiliado-tag">OFERTA ACTIVA</span>
                  <h4>INGRESO PROMOCIONAL</h4>
                  <p>
                    Aprovecha el acceso desde <strong>S/ 8</strong> y comienza a
                    construir tu negocio con Jonas Stream.
                  </p>
                  <p>
                    Cupos sujetos a disponibilidad y coordinación por WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="socio-section">
            <div className="section-head">
              <span className="section-kicker">PAGOS</span>
              <h2>MÉTODOS DISPONIBLES</h2>
              <p>
                Puedes realizar tu afiliación usando distintos métodos según tu
                preferencia y comodidad.
              </p>
            </div>

            <div className="pagos-grid">
              {pagos.map((pago) => (
                <article key={pago.titulo} className="pago-card">
                  <h3>{pago.titulo}</h3>
                  <p>{pago.texto}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="cta-final-box">
            <div className="cta-final-content">
              <h2>EMPIEZA HOY A GENERAR INGRESOS</h2>
              <p>
                Da el primer paso y solicita tu ingreso al grupo de socios.
                Recibe información, condiciones y empieza a trabajar con una
                propuesta más profesional.
              </p>
            </div>

            <div className="cta-final-actions">
              <a
                href="https://wa.me/51900557949?text=Hola,%20quiero%20unirme%20como%20socio%20en%20Jonas%20Stream"
                target="_blank"
                rel="noopener noreferrer"
                className="socio-btn socio-btn-primary"
              >
                UNIRME AHORA
              </a>

              <Link href="/ver-precios" className="socio-btn socio-btn-secondary">
                VER PRECIOS
              </Link>
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        .socio-page {
          position: relative;
          min-height: 100vh;
          padding: 28px 16px 40px;
          background:
            linear-gradient(180deg, #000000 0%, #031316 45%, #071b1e 100%);
          color: #ecffff;
          overflow: hidden;
        }

        .socio-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 18% 20%, rgba(1, 231, 239, 0.08), transparent 22%),
            radial-gradient(circle at 82% 18%, rgba(1, 139, 144, 0.07), transparent 22%),
            radial-gradient(circle at 50% 85%, rgba(0, 251, 255, 0.05), transparent 25%);
          z-index: 0;
        }

        .socio-wrap {
          position: relative;
          z-index: 2;
          width: min(1240px, 100%);
          margin: 0 auto;
        }

        .socio-offer-banner {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 18px;
          margin-bottom: 22px;
          padding: 20px 22px;
          border-radius: 26px;
          background: linear-gradient(
            135deg,
            rgba(1, 231, 239, 0.16),
            rgba(1, 139, 144, 0.1)
          );
          border: 1px solid rgba(1, 231, 239, 0.2);
          box-shadow:
            0 0 0 1px rgba(1, 231, 239, 0.06),
            0 0 24px rgba(1, 231, 239, 0.08);
        }

        .socio-offer-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.16);
          border: 1px solid rgba(236, 255, 255, 0.08);
          color: #ecffff;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .socio-offer-content h2 {
          font-family: "Orbitron", sans-serif;
          font-size: clamp(1.15rem, 2vw, 1.7rem);
          margin: 0 0 6px;
          color: #ecffff;
          letter-spacing: 1px;
        }

        .socio-offer-content p {
          margin: 0;
          color: #ecffff;
          opacity: 0.88;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .socio-offer-btn {
          min-height: 50px;
          padding: 0 18px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #ecffff;
          font-weight: 900;
          background: rgba(0, 0, 0, 0.18);
          border: 1px solid rgba(236, 255, 255, 0.08);
          transition: 0.28s ease;
        }

        .socio-offer-btn:hover {
          transform: translateY(-3px);
        }

        .socio-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
          gap: 22px;
          margin-bottom: 22px;
        }

        .socio-hero-left,
        .socio-hero-right,
        .socio-section,
        .cta-final-box {
          border-radius: 28px;
          background: rgba(3, 19, 22, 0.78);
          border: 1px solid rgba(236, 255, 255, 0.06);
          box-shadow:
            0 16px 40px rgba(0, 0, 0, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          position: relative;
          overflow: hidden;
        }

        .socio-hero-left::before,
        .socio-hero-right::before,
        .socio-section::before,
        .cta-final-box::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              135deg,
              rgba(1, 231, 239, 0.04),
              transparent 55%,
              rgba(1, 139, 144, 0.03)
            ),
            linear-gradient(180deg, rgba(236, 255, 255, 0.012), transparent);
          pointer-events: none;
        }

        .socio-hero-left {
          padding: 30px 28px;
        }

        .socio-kicker,
        .section-kicker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          padding: 6px 12px;
          margin-bottom: 16px;
          border-radius: 999px;
          background: rgba(1, 231, 239, 0.1);
          border: 1px solid rgba(1, 231, 239, 0.14);
          color: #01e7ef;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          position: relative;
          z-index: 1;
        }

        .socio-hero-left h1 {
          font-family: "Orbitron", sans-serif;
          font-size: clamp(2rem, 4vw, 3.3rem);
          line-height: 1.05;
          letter-spacing: 3px;
          color: #ecffff;
          margin: 0 0 16px;
          text-shadow:
            0 0 10px rgba(236, 255, 255, 0.08),
            0 0 18px rgba(1, 231, 239, 0.1);
          position: relative;
          z-index: 1;
        }

        .socio-lead {
          max-width: 720px;
          color: #9bc8cb;
          line-height: 1.85;
          font-size: 1rem;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .socio-hero-actions,
        .cta-final-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .socio-btn {
          min-height: 54px;
          padding: 0 20px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          text-align: center;
          font-weight: 900;
          transition: 0.28s ease;
          border: 1px solid rgba(236, 255, 255, 0.08);
        }

        .socio-btn:hover {
          transform: translateY(-3px);
        }

        .socio-btn-primary {
          color: #ecffff;
          background: linear-gradient(
            135deg,
            rgba(1, 231, 239, 0.22),
            rgba(1, 139, 144, 0.12)
          );
          border-color: rgba(1, 231, 239, 0.22);
          box-shadow:
            0 0 0 1px rgba(1, 231, 239, 0.06),
            0 0 18px rgba(1, 231, 239, 0.08);
        }

        .socio-btn-secondary {
          color: #ecffff;
          background: rgba(255, 255, 255, 0.03);
        }

        .socio-mini-benefits {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
          position: relative;
          z-index: 1;
        }

        .socio-mini-card {
          min-height: 88px;
          border-radius: 20px;
          background: linear-gradient(
            180deg,
            rgba(7, 27, 30, 0.88),
            rgba(3, 19, 22, 0.98)
          );
          border: 1px solid rgba(236, 255, 255, 0.04);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-align: center;
          padding: 14px 10px;
        }

        .socio-mini-card span {
          font-size: 1.2rem;
        }

        .socio-mini-card strong {
          color: #ecffff;
          font-size: 0.96rem;
        }

        .socio-hero-right {
          padding: 26px;
          display: flex;
          align-items: stretch;
        }

        .socio-hero-box {
          width: 100%;
          border-radius: 22px;
          padding: 24px 20px;
          background: linear-gradient(
            180deg,
            rgba(7, 27, 30, 0.88),
            rgba(3, 19, 22, 0.98)
          );
          border: 1px solid rgba(236, 255, 255, 0.05);
          position: relative;
          z-index: 1;
        }

        .socio-hero-box-badge {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 6px 12px;
          margin-bottom: 14px;
          border-radius: 999px;
          background: rgba(1, 231, 239, 0.1);
          border: 1px solid rgba(1, 231, 239, 0.14);
          color: #01e7ef;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .socio-hero-box h3 {
          font-family: "Orbitron", sans-serif;
          color: #ecffff;
          font-size: 1.2rem;
          margin: 0 0 10px;
        }

        .socio-hero-box p {
          color: #9bc8cb;
          line-height: 1.75;
          margin: 0 0 16px;
        }

        .ganancia-box {
          display: grid;
          gap: 12px;
          margin-bottom: 16px;
        }

        .ganancia-step {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 12px;
          align-items: center;
          padding: 12px 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(236, 255, 255, 0.04);
        }

        .ganancia-step span {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(1, 231, 239, 0.12);
          color: #01e7ef;
          font-weight: 900;
        }

        .ganancia-step p {
          margin: 0;
        }

        .ganancia-final {
          padding: 14px 16px;
          border-radius: 18px;
          background: linear-gradient(
            135deg,
            rgba(1, 231, 239, 0.16),
            rgba(1, 139, 144, 0.08)
          );
          border: 1px solid rgba(1, 231, 239, 0.16);
          text-align: center;
        }

        .ganancia-final strong {
          color: #ecffff;
          font-size: 1rem;
        }

        .socio-section {
          margin-bottom: 22px;
          padding: 28px 24px;
        }

        .section-head {
          max-width: 760px;
          text-align: center;
          margin: 0 auto 24px;
          position: relative;
          z-index: 1;
        }

        .section-head h2 {
          font-family: "Orbitron", sans-serif;
          font-size: clamp(1.4rem, 2vw, 2rem);
          letter-spacing: 2px;
          color: #01e7ef;
          margin: 0 0 12px;
          text-transform: uppercase;
        }

        .section-head p {
          color: #9bc8cb;
          line-height: 1.8;
          font-size: 1rem;
          margin: 0;
        }

        .beneficios-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          position: relative;
          z-index: 1;
        }

        .beneficio-card {
          min-height: 220px;
          padding: 22px 18px;
          border-radius: 22px;
          background: linear-gradient(
            180deg,
            rgba(7, 27, 30, 0.88),
            rgba(3, 19, 22, 0.98)
          );
          border: 1px solid rgba(236, 255, 255, 0.05);
          transition: 0.28s ease;
        }

        .beneficio-card:hover {
          transform: translateY(-5px);
        }

        .beneficio-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          background: rgba(1, 231, 239, 0.1);
          border: 1px solid rgba(1, 231, 239, 0.14);
          font-size: 1.35rem;
        }

        .beneficio-card h3 {
          color: #ecffff;
          font-family: "Orbitron", sans-serif;
          font-size: 1rem;
          margin: 0 0 10px;
        }

        .beneficio-card p {
          color: #9bc8cb;
          line-height: 1.75;
          font-size: 0.95rem;
          margin: 0;
        }

        .afiliado-box {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
          gap: 18px;
          position: relative;
          z-index: 1;
        }

        .afiliado-left,
        .afiliado-right {
          border-radius: 22px;
          background: linear-gradient(
            180deg,
            rgba(7, 27, 30, 0.88),
            rgba(3, 19, 22, 0.98)
          );
          border: 1px solid rgba(236, 255, 255, 0.05);
          padding: 22px 18px;
        }

        .afiliado-left h3 {
          color: #ecffff;
          font-family: "Orbitron", sans-serif;
          margin: 0 0 14px;
        }

        .afiliado-list {
          padding-left: 18px;
          color: #9bc8cb;
          line-height: 1.9;
          margin: 0;
        }

        .afiliado-card {
          height: 100%;
          border-radius: 18px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(236, 255, 255, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .afiliado-tag {
          display: inline-flex;
          align-self: flex-start;
          min-height: 28px;
          padding: 6px 10px;
          margin-bottom: 12px;
          border-radius: 999px;
          background: rgba(1, 231, 239, 0.1);
          border: 1px solid rgba(1, 231, 239, 0.14);
          color: #01e7ef;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .afiliado-card h4 {
          color: #ecffff;
          margin: 0 0 10px;
          font-family: "Orbitron", sans-serif;
        }

        .afiliado-card p {
          color: #9bc8cb;
          line-height: 1.75;
          margin: 0 0 12px;
        }

        .afiliado-card strong {
          color: #00fbff;
        }

        .pagos-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          position: relative;
          z-index: 1;
        }

        .pago-card {
          min-height: 170px;
          padding: 22px 16px;
          border-radius: 22px;
          background: linear-gradient(
            180deg,
            rgba(7, 27, 30, 0.88),
            rgba(3, 19, 22, 0.98)
          );
          border: 1px solid rgba(236, 255, 255, 0.05);
          text-align: center;
          transition: 0.28s ease;
        }

        .pago-card:hover {
          transform: translateY(-5px);
        }

        .pago-card h3 {
          color: #01e7ef;
          font-family: "Orbitron", sans-serif;
          font-size: 1rem;
          margin: 0 0 12px;
        }

        .pago-card p {
          color: #9bc8cb;
          line-height: 1.75;
          font-size: 0.94rem;
          margin: 0;
        }

        .cta-final-box {
          padding: 28px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          margin-bottom: 20px;
        }

        .cta-final-content {
          max-width: 760px;
          position: relative;
          z-index: 1;
        }

        .cta-final-content h2 {
          font-family: "Orbitron", sans-serif;
          color: #ecffff;
          font-size: clamp(1.5rem, 2.6vw, 2.2rem);
          letter-spacing: 2px;
          margin: 0 0 12px;
        }

        .cta-final-content p {
          color: #9bc8cb;
          line-height: 1.8;
          font-size: 1rem;
          margin: 0;
        }

        @media (max-width: 1100px) {
          .socio-offer-banner,
          .socio-hero,
          .afiliado-box,
          .cta-final-box {
            grid-template-columns: 1fr;
            display: grid;
          }

          .cta-final-box {
            align-items: flex-start;
          }

          .beneficios-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pagos-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 780px) {
          .beneficios-grid,
          .pagos-grid {
            grid-template-columns: 1fr;
          }

          .socio-mini-benefits {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .socio-page {
            padding: 18px 12px 28px;
          }

          .socio-offer-banner,
          .socio-hero-left,
          .socio-hero-right,
          .socio-section,
          .cta-final-box {
            padding: 20px 14px;
            border-radius: 22px;
          }

          .socio-offer-content h2 {
            font-size: 1rem;
          }

          .socio-hero-left h1 {
            font-size: 1.7rem;
            letter-spacing: 2px;
          }

          .socio-lead,
          .section-head p,
          .cta-final-content p {
            font-size: 0.95rem;
            line-height: 1.75;
          }

          .socio-btn {
            width: 100%;
          }

          .socio-hero-actions,
          .cta-final-actions {
            width: 100%;
          }

          .beneficio-card,
          .pago-card,
          .afiliado-left,
          .afiliado-right {
            border-radius: 18px;
            padding: 18px 14px;
            min-height: auto;
          }

          .socio-hero-box {
            padding: 18px 14px;
            border-radius: 18px;
          }

          .ganancia-step {
            grid-template-columns: 30px 1fr;
            gap: 10px;
            padding: 10px;
          }

          .ganancia-step span {
            width: 30px;
            height: 30px;
          }

          .cta-final-content h2 {
            font-size: 1.35rem;
          }
        }
      `}</style>
    </>
  );
}