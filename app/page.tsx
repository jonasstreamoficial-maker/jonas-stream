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
            <a href="/login" className="top-link primary">
              INICIAR SESIÓN
            </a>

            <a href="/tienda" className="top-link">
              TIENDA
            </a>
          </div>
        </div>
      </div>

      <main className="container">
        <section className="hero">

          <div className="panel hero-main">
            <div className="hero-content">

              {/* IZQUIERDA */}
              <div className="hero-left">
                <div className="mini">BIENVENIDOS A</div>

                <h1 className="title">JONAS STREAM</h1>

                <div className="sub">PLATAFORMA OFICIAL PREMIUM</div>

                <div className="shine"></div>

                <p className="text">
                  Tu proveedor de confianza en plataformas de streaming,
                  música y accesos digitales premium.
                  Vive una experiencia moderna, elegante y profesional
                  para clientes y revendedores.
                </p>

                <div className="buttons">
                  <a href="/tienda" className="btn btn1">
                    VER PRECIOS
                  </a>

                  <a href="/login" className="btn btn2">
                    QUIERO SER SOCIO
                  </a>
                </div>
              </div>

              {/* DERECHA */}
              <div className="hero-right">
                <div className="logo-box">
                  <div className="logo-frame">
                    <img
                      src="/PERFIL WEB.jpg"
                      alt="Jonas Stream"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* STATS */}
          <div className="panel stats-panel">
            <div className="stats">

              <div className="card">
                <h3>+2K CLIENTES</h3>
                <p>
                  Miles de usuarios ya confiaron en Jonas Stream.
                </p>
              </div>

              <div className="card">
                <h3>SOPORTE 24/7</h3>
                <p>
                  Atención rápida para ventas, soporte y activaciones.
                </p>
              </div>

              <div className="card">
                <h3>BOT TELEGRAM</h3>
                <p>
                  Sistema automático para respuestas inmediatas.
                </p>
              </div>

            </div>
          </div>

          {/* REDES */}
          <div className="panel social-panel">
            <div className="social-head">
              <h2 className="social-title">
                Síguenos en Nuestras Redes Sociales
              </h2>

              <p className="social-text">
                Facebook, Instagram, TikTok, Telegram y YouTube
              </p>
            </div>

            <div className="social-icons">

              <a
                href="https://www.facebook.com/jonasstream.oficiall"
                target="_blank"
                className="social-link"
              >
                F
              </a>

              <a
                href="https://www.instagram.com/jonasstream.oficiall/"
                target="_blank"
                className="social-link"
              >
                I
              </a>

              <a
                href="https://www.tiktok.com/@jonasstream.oficiall"
                target="_blank"
                className="social-link"
              >
                T
              </a>

              <a
                href="https://t.me/jonasstream_oficiall"
                target="_blank"
                className="social-link"
              >
                TG
              </a>

              <a
                href="https://www.youtube.com/@jonasstream.oficiall"
                target="_blank"
                className="social-link"
              >
                Y
              </a>

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