import Link from "next/link"

const modules = [
  {
    href: "/admin",
    icon: "⚙️",
    title: "Admin",
    description:
      "Gestiona usuarios, productos, pedidos, configuraciones y el control total del sistema.",
  },
  {
    href: "/cliente",
    icon: "👤",
    title: "Cliente",
    description:
      "Consulta compras, perfil, historial, favoritos y una experiencia personalizada.",
  },
  {
    href: "/proveedor",
    icon: "📦",
    title: "Proveedor",
    description:
      "Visualiza productos asignados, stock, movimientos y gestión operativa.",
  },
  {
    href: "/tienda",
    icon: "🛒",
    title: "Tienda",
    description:
      "Explora productos disponibles dentro de una interfaz moderna, atractiva y escalable.",
  },
  {
    href: "/carrito",
    icon: "💳",
    title: "Carrito",
    description:
      "Revisa cantidades, subtotales, totales y todo el flujo de compra.",
  },
  {
    href: "/favoritos",
    icon: "⭐",
    title: "Favoritos",
    description:
      "Guarda productos destacados para acceder rápidamente cuando quieras.",
  },
]

export default function HomePage() {
  return (
    <div className="page-shell">
      <div className="bg-glow glow-a" />
      <div className="bg-glow glow-b" />
      <div className="bg-glow glow-c" />

      <main className="home-main">
        <section className="home-container">
          
          {/* TOP BAR */}
          <header className="home-topbar">
            <div className="brand-wrap">
              <span className="brand-dot" />
              <p className="brand">JONAS STREAM</p>
            </div>

            <div className="status-pill">
              <span className="status-dot" />
              Sistema online y listo para operar
            </div>
          </header>

          {/* HERO */}
          <section className="hero-grid">
            
            {/* TEXTO */}
            <div className="hero-copy">
              <span className="eyebrow">Plataforma premium digital</span>

              <h1 className="title-neon">
                Accesos <span className="accent">premium</span> en un solo lugar
              </h1>

              <p className="subtitle">
                Streaming, cuentas digitales, apps y servicios en una plataforma
                moderna, rápida y pensada para escalar como negocio real.
              </p>

              <div className="hero-actions">
                <Link href="/login" className="btn-primary">
                  Iniciar sesión
                </Link>

                <Link href="/tienda" className="btn-secondary">
                  Explorar tienda
                </Link>
              </div>

              <div className="hero-stats">
                <div className="stat-card">
                  <h3>24/7</h3>
                  <p>Disponibilidad total del sistema.</p>
                </div>

                <div className="stat-card">
                  <h3>+{modules.length}</h3>
                  <p>Módulos integrados listos para operar.</p>
                </div>

                <div className="stat-card">
                  <h3>PRO</h3>
                  <p>Diseño premium enfocado en ventas.</p>
                </div>
              </div>
            </div>

            {/* LOGO (NUEVO 🔥) */}
            <aside className="hero-panel">
              <img
                src="/logo-jonas.png"
                alt="JONAS STREAM"
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  margin: "0 auto",
                  display: "block",
                  filter: "drop-shadow(0 0 25px rgba(0,229,255,0.35))",
                }}
              />
            </aside>
          </section>

          {/* MODULOS */}
          <section className="routes-section">
            <div className="section-head">
              <div>
                <h2>Módulos principales</h2>
                <p>
                  Accede rápidamente a las secciones más importantes del sistema.
                </p>
              </div>
            </div>

            <div className="grid">
              {modules.map((item) => (
                <Link key={item.href} href={item.href} className="card-hover">
                  <div className="card-top">
                    <div className="card-icon">{item.icon}</div>
                    <span className="card-link">Entrar</span>
                  </div>

                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </section>

        </section>
      </main>
    </div>
  )
}