import Link from "next/link"

const modules = [
  {
    href: "/admin",
    icon: "⚙️",
    title: "Admin",
    description: "Gestiona usuarios, productos, pedidos y configuraciones.",
  },
  {
    href: "/cliente",
    icon: "👤",
    title: "Cliente",
    description: "Consulta compras, favoritos e historial.",
  },
  {
    href: "/proveedor",
    icon: "📦",
    title: "Proveedor",
    description: "Visualiza productos, stock y operaciones.",
  },
  {
    href: "/tienda",
    icon: "🛒",
    title: "Tienda",
    description: "Explora productos digitales disponibles.",
  },
  {
    href: "/carrito",
    icon: "💳",
    title: "Carrito",
    description: "Revisa cantidades, totales y flujo de compra.",
  },
  {
    href: "/favoritos",
    icon: "⭐",
    title: "Favoritos",
    description: "Guarda productos importantes para volver luego.",
  },
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
          <header className="landing-topbar-simple">
            <div className="brand-line">
              <span className="brand-core" />
              <p className="brand-name">JONAS STREAM</p>
            </div>

            <nav className="top-links">
              <Link href="/login" className="top-link">
                Iniciar sesión
              </Link>
              <Link href="/tienda" className="top-link top-link-primary">
                Tienda
              </Link>
            </nav>
          </header>

          <section className="home-boxes">
            <div className="welcome-box">
              <span className="section-kicker">PLATAFORMA DIGITAL PREMIUM</span>
              <h1>Bienvenidos a JONAS STREAM</h1>
              <p>
                Una plataforma moderna para gestionar y vender cuentas digitales
                con presencia profesional, estructura sólida y diseño elegante.
              </p>

              <div className="hero-actions">
                <Link href="/login" className="btn-primary">
                  Iniciar sesión
                </Link>
                <Link href="/tienda" className="btn-secondary">
                  Explorar tienda
                </Link>
              </div>
            </div>

            <div className="info-box">
              <span className="section-kicker">MODELO DE NEGOCIO</span>
              <h2>Soluciones digitales para crecer</h2>
              <p>
                En JONAS STREAM trabajamos con cuentas por mayor, sistema de
                referidos y estructura para proveedores. Nuestra propuesta está
                pensada para ofrecer una experiencia profesional, escalable y
                lista para operar como un negocio digital serio.
              </p>

              <div className="info-tags">
                <span>Cuentas por mayor</span>
                <span>Referidos</span>
                <span>Proveedores</span>
                <span>Modelo Pro</span>
              </div>
            </div>
          </section>

          <section className="modules-section">
            <div className="section-copy">
              <span className="section-kicker">NAVEGACIÓN PRINCIPAL</span>
              <h2>Módulos del sistema</h2>
              <p>
                Accede rápidamente a las secciones más importantes del sistema
                desde una interfaz moderna y ordenada.
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