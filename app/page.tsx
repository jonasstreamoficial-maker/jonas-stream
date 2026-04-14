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

          <section className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Plataforma premium de gestión digital</span>

              <h1 className="title-neon">
                Controla tu <span className="accent">ecosistema digital</span> con
                una experiencia moderna y profesional
              </h1>

              <p className="subtitle">
                Administra usuarios, productos, pedidos, carrito, favoritos y
                operaciones clave desde una interfaz futurista, sólida y pensada
                para crecer como una plataforma real de alto nivel.
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
                  <p>Disponibilidad operativa para tu negocio digital.</p>
                </div>

                <div className="stat-card">
                  <h3>+{modules.length}</h3>
                  <p>Módulos estratégicos integrados en la plataforma.</p>
                </div>

                <div className="stat-card">
                  <h3>PRO</h3>
                  <p>Diseño premium con identidad visual moderna.</p>
                </div>
              </div>
            </div>

            <aside className="hero-panel">
              <p className="panel-label">Resumen ejecutivo</p>

              <div className="mini-dashboard">
                <div className="mini-card">
                  <div className="mini-highlight">
                    <div>
                      <p>Experiencia visual</p>
                      <div className="mini-number">98%</div>
                    </div>
                    <span className="mini-badge">Premium UI</span>
                  </div>
                </div>

                <div className="mini-card">
                  <h4>Escalabilidad real</h4>
                  <p>
                    Base ideal para evolucionar hacia autenticación avanzada,
                    dashboards, reportes, analytics y más módulos comerciales.
                  </p>
                </div>

                <div className="mini-card">
                  <h4>Estructura organizada</h4>
                  <p>
                    Separación clara entre rutas, componentes y estilos para
                    construir un proyecto robusto, limpio y mantenible.
                  </p>
                </div>

                <div className="mini-card">
                  <h4>Enfoque comercial</h4>
                  <p>
                    Pensado para plataformas de venta digital con imagen fuerte,
                    navegación clara y presencia visual profesional.
                  </p>
                </div>
              </div>
            </aside>
          </section>

          <section className="routes-section">
            <div className="section-head">
              <div>
                <h2>Módulos principales</h2>
                <p>
                  Accede rápidamente a las áreas más importantes del sistema desde
                  una interfaz elegante, potente y preparada para producción.
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