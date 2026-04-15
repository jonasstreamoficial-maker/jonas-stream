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

const stats = [
  { value: "24/7", label: "Operatividad continua" },
  { value: "+6", label: "Módulos conectados" },
  { value: "PRO", label: "Imagen premium" },
]

export default function HomePage() {
  return (
    <div className="page-shell">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <div className="bg-orb orb-c" />
      <div className="grid-overlay" />
      <div className="noise-layer" />

      <main className="landing-main">
        <section className="landing-wrap">
          <header className="landing-topbar">
            <div className="brand-line">
              <span className="brand-core" />
              <div>
                <p className="brand-name">JONAS STREAM</p>
                <span className="brand-subtitle">PLATAFORMA DIGITAL PREMIUM</span>
              </div>
            </div>

            <div className="topbar-actions">
              <Link href="/tienda" className="mini-nav-link">
                Tienda
              </Link>
              <Link href="/login" className="mini-nav-link">
                Login
              </Link>

              <div className="live-pill">
                <span className="live-dot" />
                Sistema online
              </div>
            </div>
          </header>

          <section className="hero-block">
            <div className="hero-copy">
              <span className="eyebrow-pill">ECOSISTEMA DIGITAL DE ALTO NIVEL</span>

              <h1 className="hero-title">
                Lleva tu marca a una
                <span className="hero-accent"> experiencia premium</span>
              </h1>

              <p className="hero-text">
                JONAS STREAM integra tienda, carrito, favoritos, pedidos, clientes
                y administración en una sola plataforma con presencia visual fuerte,
                diseño moderno y estructura lista para crecer.
              </p>

              <div className="hero-actions">
                <Link href="/login" className="btn-primary">
                  Iniciar sesión
                </Link>

                <Link href="/tienda" className="btn-secondary">
                  Explorar tienda
                </Link>
              </div>

              <div className="hero-points">
                <span className="hero-chip">Diseño corporativo</span>
                <span className="hero-chip">Estética turquesa + negro</span>
                <span className="hero-chip">Base escalable</span>
              </div>

              <div className="hero-metrics">
                {stats.map((item) => (
                  <div key={item.label} className="metric-card">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="hero-showcase">
              <div className="showcase-frame">
                <div className="showcase-ring ring-1" />
                <div className="showcase-ring ring-2" />
                <div className="showcase-ring ring-3" />

                <div className="showcase-core">
                  <span className="core-kicker">JONAS STREAM</span>
                  <h2>Control total de tu plataforma</h2>
                  <p>
                    Un entorno visual elegante con identidad fuerte, pensado para
                    vender, gestionar y transmitir una imagen seria.
                  </p>

                  <div className="core-badges">
                    <span>Admin</span>
                    <span>Productos</span>
                    <span>Pedidos</span>
                    <span>Clientes</span>
                  </div>
                </div>

                <div className="floating-panel panel-one">
                  <span className="floating-label">Diseño premium</span>
                  <strong>Interfaz moderna</strong>
                </div>

                <div className="floating-panel panel-two">
                  <span className="floating-label">Estado</span>
                  <strong>Activo y escalable</strong>
                </div>
              </div>
            </aside>
          </section>

          <section className="brand-strip">
            <div className="brand-strip-line" />
            <div className="brand-strip-content">
              <span>NEGRO</span>
              <span>TURQUESA</span>
              <span>PRESENCIA</span>
              <span>PREMIUM</span>
              <span>PROFESIONAL</span>
              <span>ESCALABLE</span>
            </div>
          </section>

          <section className="modules-section">
            <div className="section-copy">
              <span className="section-kicker">MÓDULOS PRINCIPALES</span>
              <h2>Una portada conectada con todo tu sistema</h2>
              <p>
                Desde aquí puedes dirigir la experiencia hacia las áreas más
                importantes del negocio con una presentación más limpia, elegante
                y alineada a la identidad de JONAS STREAM.
              </p>
            </div>

            <div className="modules-grid">
              {modules.map((item) => (
                <Link key={item.href} href={item.href} className="module-card">
                  <div className="module-top">
                    <div className="module-icon">{item.icon}</div>
                    <span className="module-link">Abrir módulo</span>
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