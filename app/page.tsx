import Link from "next/link"

const modules = [
  {
    href: "/admin",
    icon: "⚙️",
    title: "Admin",
    description: "Gestiona todo el sistema",
  },
  {
    href: "/cliente",
    icon: "👤",
    title: "Cliente",
    description: "Historial, perfil y compras",
  },
  {
    href: "/proveedor",
    icon: "📦",
    title: "Proveedor",
    description: "Productos y operaciones",
  },
  {
    href: "/tienda",
    icon: "🛒",
    title: "Tienda",
    description: "Explorar productos",
  },
  {
    href: "/carrito",
    icon: "💳",
    title: "Carrito",
    description: "Proceso de compra",
  },
  {
    href: "/favoritos",
    icon: "⭐",
    title: "Favoritos",
    description: "Productos guardados",
  },
]

export default function HomePage() {
  return (
    <div className="page-shell">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <div className="bg-orb orb-c" />

      <main className="landing-main">
        <section className="landing-wrap">

          {/* 🔹 TOPBAR */}
          <header className="topbar">
            <div className="brand">JONAS STREAM</div>

            <div className="nav">
              <Link href="/login">Iniciar sesión</Link>
              <Link href="/tienda" className="btn-nav">
                Tienda
              </Link>
            </div>
          </header>

          {/* 🔹 BIENVENIDA */}
          <section className="box">
            <h1>Bienvenidos a JONAS STREAM</h1>
            <p>
              Plataforma digital profesional para venta de cuentas,
              gestión de clientes, proveedores y sistema escalable.
            </p>

            <div className="actions">
              <Link href="/login" className="btn-primary">
                Iniciar sesión
              </Link>
              <Link href="/tienda" className="btn-secondary">
                Explorar tienda
              </Link>
            </div>
          </section>

          {/* 🔹 DESCRIPCIÓN */}
          <section className="box">
            <h2>Modelo de negocio</h2>
            <p>
              Sistema enfocado en cuentas por mayor, referidos y
              proveedores. Diseñado para escalar como negocio digital real.
            </p>

            <div className="tags">
              <span>Mayorista</span>
              <span>Referidos</span>
              <span>Proveedores</span>
              <span>Escalable</span>
            </div>
          </section>

          {/* 🔹 MÓDULOS */}
          <section className="modules">
            {modules.map((item) => (
              <Link key={item.href} href={item.href} className="card">
                <div className="icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </section>

        </section>
      </main>
    </div>
  )
}