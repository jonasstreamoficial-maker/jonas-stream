import Link from "next/link"

const modules = [
  {
    href: "/admin",
    icon: "⚙️",
    title: "Admin",
    description:
      "Gestiona usuarios, productos, pedidos, configuraciones y el control central de la plataforma.",
  },
  {
    href: "/cliente",
    icon: "👤",
    title: "Cliente",
    description:
      "Consulta historial, compras, favoritos y una experiencia personalizada dentro del sistema.",
  },
  {
    href: "/proveedor",
    icon: "📦",
    title: "Proveedor",
    description:
      "Visualiza stock, productos asignados, operaciones y flujo interno de trabajo.",
  },
  {
    href: "/tienda",
    icon: "🛒",
    title: "Tienda",
    description:
      "Explora una vitrina moderna con productos digitales, filtros, ofertas y presentación premium.",
  },
  {
    href: "/carrito",
    icon: "💳",
    title: "Carrito",
    description:
      "Controla cantidades, subtotales, cupones, resumen y avance de compra en tiempo real.",
  },
  {
    href: "/favoritos",
    icon: "⭐",
    title: "Favoritos",
    description:
      "Guarda accesos importantes y vuelve a encontrarlos rápidamente cuando quieras.",
  },
]

const pillars = [
  "Experiencia premium",
  "Control total del negocio",
  "Escalable y profesional",
]

export default function HomePage() {
  return (
    <div className="page-shell">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <div className="bg-orb orb-c" />
      <div className="grid-overlay" />

      <main className="landing-main">
        <section className="landing-wrap">
          <header className="landing-topbar">
            <div className="brand-line">
              <span className="brand-core" />
              <p className="brand-name">JONAS STREAM</p>
            </div>

            <div className="live-pill">
              <span className="live-dot" />
              Plataforma activa y lista para operar
            </div>
          </header>

          <section className="hero-block">
            <div className="hero-copy">
              <span className="eyebrow-pill">Plataforma digital premium</span>

              <h1 className="hero-title">
                Una portada elegante para un
                <span className="hero-accent"> negocio serio</span>
              </h1>

              <p className="hero-text">
                Centraliza tienda, pedidos, clientes, favoritos, carrito y
                administración en una experiencia visual moderna, sólida y lista
                para crecer como producto real.
              </p>

              <div className="hero-actions">
                <Link href="/tienda" className="btn-primary">
                  Explorar tienda
                </Link>

                <Link href="/login" className="btn-secondary">
                  Iniciar sesión
                </Link>
              </div>

              <div className="hero-points">
                {pillars.map((item) => (
                  <span key={item} className="hero-chip">
                    {item}
                  </span>
                ))}
              </div>

              <div className="hero-metrics">
                <div className="metric-card">
                  <strong>24/7</strong>
                  <span>Disponibilidad para operar sin pausas.</span>
                </div>

                <div className="metric-card">
                  <strong>+{modules.length}</strong>
                  <span>Módulos principales integrados.</span>
                </div>

                <div className="metric-card">
                  <strong>PRO</strong>
                  <span>Diseño premium enfocado en conversión.</span>
                </div>
              </div>
            </div>

            <aside className="hero-showcase">
              <div className="showcase-frame">
                <div className="showcase-ring ring-1" />
                <div className="showcase-ring ring-2" />
                <div className="showcase-ring ring-3" />

                <div className="showcase-core">
                  <span className="core-kicker">JONAS STREAM</span>
                  <h2>Control. Diseño. Presencia.</h2>
                  <p>
                    Un sistema con identidad visual fuerte, estructura limpia y
                    una interfaz preparada para vender mejor.
                  </p>

                  <div className="core-badges">
                    <span>Admin</span>
                    <span>Tienda</span>
                    <span>Pedidos</span>
                    <span>Favoritos</span>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section className="modules-section">
            <div className="section-copy">
              <span className="section-kicker">Navegación principal</span>
              <h2>Módulos estratégicos del sistema</h2>
              <p>
                Accede a las áreas más importantes desde una portada más limpia,
                elegante y profesional, pensada para una plataforma moderna.
              </p>
            </div>

            <div className="modules-grid">
              {modules.map((item) => (
                <Link key={item.href} href={item.href} className="module-card">
                  <div className="module-top">
                    <div className="module-icon">{item.icon}</div>
                    <span className="module-link">Entrar</span>
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