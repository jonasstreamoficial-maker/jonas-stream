import Link from "next/link"

const modules = [
  {
    href: "/admin",
    icon: "⚙️",
    title: "Admin",
    description: "Gestiona usuarios, productos, pedidos y el control total del sistema.",
  },
  {
    href: "/cliente",
    icon: "👤",
    title: "Cliente",
    description: "Consulta compras, perfil, historial y experiencia personalizada.",
  },
  {
    href: "/proveedor",
    icon: "📦",
    title: "Proveedor",
    description: "Visualiza información asignada, stock, catálogo y movimientos.",
  },
  {
    href: "/tienda",
    icon: "🛒",
    title: "Tienda",
    description: "Explora productos disponibles dentro de una interfaz moderna.",
  },
  {
    href: "/carrito",
    icon: "💳",
    title: "Carrito",
    description: "Revisa la compra, cantidades, totales y flujo de checkout.",
  },
  {
    href: "/favoritos",
    icon: "⭐",
    title: "Favoritos",
    description: "Guarda productos importantes para volver rápido cuando quieras.",
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
          <div className="home-topbar">
            <div className="brand-wrap">
              <span className="brand-dot" />
              <p className="brand">JONAS STREAM</p>
            </div>

            <div className="status-pill">Sistema online y listo para operar</div>
          </div>

          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Panel premium de gestión digital</span>

              <h1 className="title-neon">
                Plataforma <span className="accent">profesional</span> de ventas
                digitales
              </h1>

              <p className="subtitle">
                Administra usuarios, productos, pedidos, carrito, favoritos y más
                dentro de una experiencia visual moderna, potente y escalable,
                diseñada para verse como un producto premium real.
              </p>

              <div className="hero-actions">
                <Link href="/login" className="btn-primary">
                  Iniciar sesión
                </Link>

                <Link href="/tienda" className="btn-secondary">
                  Ver tienda
                </Link>
              </div>

              <div className="hero-stats">
                <div className="stat-card">
                  <h3>24/7</h3>
                  <p>Operación disponible y lista para crecer.</p>
                </div>

                <div className="stat-card">
                  <h3>+6</h3>
                  <p>Módulos principales integrados en la plataforma.</p>
                </div>

                <div className="stat-card">
                  <h3>PRO</h3>
                  <p>Interfaz sólida con look premium futurista.</p>
                </div>
              </div>
            </div>

            <aside className="hero-panel">
              <p className="panel-label">Vista rápida</p>

              <div className="mini-dashboard">
                <div className="mini-card">
                  <div className="mini-highlight">
                    <div>
                      <p>Rendimiento visual</p>
                      <div className="mini-number">98%</div>
                    </div>
                    <span className="mini-badge">Neon UI</span>
                  </div>
                </div>

                <div className="mini-card">
                  <h4>Diseño premium</h4>
                  <p>
                    Base ideal para evolucionar hacia dashboard admin, auth,
                    analytics y paneles avanzados.
                  </p>
                </div>

                <div className="mini-card">
                  <h4>Arquitectura limpia</h4>
                  <p>
                    Separación correcta entre layout, estilos globales y página
                    principal para escalar como proyecto real.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <div className="routes-section">
            <div className="section-head">
              <div>
                <h2>Módulos principales</h2>
                <p>
                  Accesos rápidos a las secciones más importantes del sistema,
                  con una interfaz más fuerte, elegante y profesional.
                </p>
              </div>
            </div>

            <div className="grid">
              {modules.map((item) => (
                <Link key={item.href} href={item.href} className="card-hover">
                  <div className="card-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}