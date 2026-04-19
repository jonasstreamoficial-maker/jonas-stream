// app/page.tsx

import Link from "next/link"

export default function HomePage() {
  return (
    <main className="page">

      <header className="topbar">
        <div className="logo">JONAS STREAM</div>

        <nav className="nav">
          <Link href="/login" className="btn-nav">INICIAR SESIÓN</Link>
          <Link href="/tienda" className="btn-nav">TIENDA</Link>
        </nav>
      </header>

      <section className="hero">

        <div>
          <div className="mini">BIENVENID@S A</div>

          <h1 className="title">
            JONAS STREAM
          </h1>

          <div className="sub">PLATAFORMA OFICIAL</div>

          <p className="desc">
            Tu proveedor de confianza en plataformas de streaming,
            música y accesos digitales premium. Vive una experiencia
            moderna, elegante y profesional para clientes y revendedores.
          </p>

          <div className="actions">
            <Link href="/tienda" className="btn-main primary">
              VER PRECIOS
            </Link>

            <Link href="/registro" className="btn-main secondary">
              QUIERO SER SOCIO
            </Link>
          </div>

          <div className="stats">

            <div className="stat">
              <strong>⚡</strong>
              Velocidad
            </div>

            <div className="stat">
              <strong>🛡️</strong>
              Garantía
            </div>

            <div className="stat">
              <strong>💸</strong>
              Ahorro
            </div>

          </div>
        </div>

        <div className="imagebox">
          <img src="/PERFIL WEB.jpg" alt="Jonas Stream Logo" />
        </div>

      </section>

      <section className="cards">

        <div className="card">
          <h3>+2K CLIENTES</h3>
          <p>Miles de usuarios ya confiaron en nosotros.</p>
        </div>

        <div className="card">
          <h3>SOPORTE 24/7</h3>
          <p>Atención rápida para ventas y activaciones.</p>
        </div>

        <div className="card">
          <h3>BOT TELEGRAM</h3>
          <p>Sistema automático profesional e inmediato.</p>
        </div>

      </section>

      <footer className="footer">
        © 2026 Jonas Stream - Todos los derechos reservados
      </footer>

    </main>
  )
}