import Link from "next/link"

export default function HomePage() {
  return (
    <main className="home-main">
      {/* FONDOS */}
      <div className="bg-glow top-left"></div>
      <div className="bg-glow bottom-right"></div>

      <section className="home-container">
        <p className="brand glow-text">JONAS STREAM</p>

        <h1 className="title-neon">
          Plataforma profesional de ventas digitales
        </h1>

        <p className="subtitle">
          Administra usuarios, productos, pedidos, carrito, favoritos y más
          dentro de una experiencia moderna y escalable.
        </p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "30px" }}>
          <Link href="/login" className="btn-primary">
            Iniciar sesión
          </Link>

          <Link href="/tienda" className="btn-secondary">
            Ver tienda
          </Link>
        </div>

        <div className="grid">
          <Link href="/admin" className="card-hover">
            <h3>Admin</h3>
            <p>Gestiona usuarios, productos y pedidos</p>
          </Link>

          <Link href="/cliente" className="card-hover">
            <h3>Cliente</h3>
            <p>Consulta compras y perfil</p>
          </Link>

          <Link href="/proveedor" className="card-hover">
            <h3>Proveedor</h3>
            <p>Visualiza información asignada</p>
          </Link>

          <Link href="/tienda" className="card-hover">
            <h3>Tienda</h3>
            <p>Explora productos disponibles</p>
          </Link>

          <Link href="/carrito" className="card-hover">
            <h3>Carrito</h3>
            <p>Revisa tu compra</p>
          </Link>

          <Link href="/favoritos" className="card-hover">
            <h3>Favoritos</h3>
            <p>Guarda productos importantes</p>
          </Link>
        </div>
      </section>
    </main>
  )
}