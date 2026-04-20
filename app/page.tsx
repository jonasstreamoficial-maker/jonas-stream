import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <div className="side-brand">JONAS STREAM</div>
      <div className="side-brand right">JONAS STREAM</div>

      <div className="container topbar-wrap">
        <div className="topbar">
          <div className="brand-logo">
            <strong>JONAS STREAM</strong>
            <span>Plataforma Premium Oficial</span>
          </div>

          <div className="topbar-right">
            <Link href="/login" className="top-link primary">
              INICIAR SESIÓN
            </Link>

            <a
              href="https://wa.me/51900557949"
              target="_blank"
              rel="noopener noreferrer"
              className="top-link"
            >
              CONTÁCTANOS
            </a>
          </div>
        </div>
      </div>

      <main className="container">
        <section className="hero">
          <div className="hero-stack">
            <div className="panel hero-main">
              <div className="hero-content">
                <div className="hero-left">
                  <div className="mini">BIENVENIDOS A</div>

                  <h1 className="title">JONAS STREAM</h1>

                  <div className="sub">PLATAFORMA OFICIAL PREMIUM</div>

                  <div className="shine"></div>

                  <p className="text">
                    Tu proveedor de confianza en plataformas de streaming,
                    música y accesos digitales premium. Disfruta una experiencia
                    moderna, rápida y segura, diseñada para clientes y
                    revendedores que buscan calidad, soporte y confianza.
                  </p>

                  <div className="buttons">
                    <Link href="/quiero-ser-socio" className="btn btn1">
                      QUIERO SER SOCIO
                    </Link>

                    <Link href="/ver-precios" className="btn btn2">
                      VER PRECIOS
                    </Link>
                  </div>

                  <div className="benefits-joined">
                    <div className="benefits">
                      <div className="benefit">
                        <div className="benefit-inner">
                          <span className="benefit-emoji">⚡</span>
                          <span className="benefit-label">Velocidad</span>
                        </div>
                      </div>

                      <div className="benefit">
                        <div className="benefit-inner">
                          <span className="benefit-emoji">🛡️</span>
                          <span className="benefit-label">Garantía</span>
                        </div>
                      </div>

                      <div className="benefit">
                        <div className="benefit-inner">
                          <span className="benefit-emoji">💸</span>
                          <span className="benefit-label">Ahorro</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hero-right">
                  <div className="logo-box">
                    <div className="logo-frame">
                      <img src="/PERFIL WEB.jpg" alt="Logo Jonas Stream" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel stats-panel">
              <div className="stats">
                <div className="card">
                  <span className="card-kicker">Confianza</span>
                  <h3>+2K CLIENTES</h3>
                  <p>
                    Más de dos mil usuarios ya confiaron en Jonas Stream para
                    obtener accesos digitales premium con atención seria y
                    servicio seguro.
                  </p>
                </div>

                <div className="card">
                  <span className="card-kicker">Atención</span>
                  <h3>SOPORTE 24/7</h3>
                  <p>
                    Respuesta rápida para ventas, activaciones, consultas y
                    soporte técnico, con acompañamiento cuando más lo necesites.
                  </p>
                </div>

                <div className="card">
                  <span className="card-kicker">Automatización</span>
                  <h3>BOT TELEGRAM</h3>
                  <p>
                    Sistema automatizado para respuestas inmediatas y una
                    experiencia mucho más profesional, ordenada y eficiente.
                  </p>
                </div>
              </div>
            </div>

            <div className="panel social-panel">
              <div className="social-head">
                <h2 className="social-title">
                  Síguenos en Nuestras Redes Sociales
                </h2>
                <p className="social-text">
                  Conéctate con Jonas Stream en Facebook, Instagram, TikTok,
                  Telegram y YouTube.
                </p>
              </div>

              <div className="social-icons">
                <a
                  className="social-link facebook"
                  href="https://www.facebook.com/jonasstream.oficiall"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.2-1.6 1.6-1.6H16.7V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.4H7.5V14h2.7v8h3.3z" />
                  </svg>
                </a>

                <a
                  className="social-link instagram"
                  href="https://www.instagram.com/jonasstream.oficiall/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5zm8.95 1.35a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8z" />
                  </svg>
                </a>

                <a
                  className="social-link tiktok"
                  href="https://www.tiktok.com/@jonasstream.oficiall"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14.5 3c.5 2.1 1.8 3.6 3.9 4V9c-1.4 0-2.7-.4-3.9-1.2v6.5a4.8 4.8 0 1 1-4.8-4.8c.3 0 .5 0 .8.1v2.4a2.7 2.7 0 1 0 1.9 2.6V3h2.1z" />
                  </svg>
                </a>

                <a
                  className="social-link telegram"
                  href="https://t.me/jonasstream_oficiall"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M21.4 4.6 18.3 19c-.2 1-.8 1.2-1.6.8l-4.4-3.2-2.1 2c-.2.2-.4.4-.8.4l.3-4.5 8.3-7.5c.4-.3-.1-.5-.5-.2L7.3 13 2.9 11.6c-1-.3-1-.9.2-1.3L20.3 3.7c.8-.3 1.4.2 1.1.9z" />
                  </svg>
                </a>

                <a
                  className="social-link youtube"
                  href="https://www.youtube.com/@jonasstream.oficiall"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M21.8 8.6c-.2-1.3-1.2-2.3-2.5-2.5C17.4 5.8 12 5.8 12 5.8s-5.4 0-7.3.3C3.4 6.3 2.4 7.3 2.2 8.6 2 10.4 2 12 2 12s0 1.6.2 3.4c.2 1.3 1.2 2.3 2.5 2.5 1.9.3 7.3.3 7.3.3s5.4 0 7.3-.3c1.3-.2 2.3-1.2 2.5-2.5.2-1.8.2-3.4.2-3.4s0-1.6-.2-3.4zM10 15.5v-7l6 3.5-6 3.5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footer">
            © 2026 Jonas Stream. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </>
  );
}