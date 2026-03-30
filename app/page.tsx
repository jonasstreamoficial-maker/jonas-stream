import Link from "next/link"

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#030507",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "rgba(11, 17, 24, 0.9)",
          border: "1px solid rgba(0,229,255,0.18)",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 0 24px rgba(0,229,255,0.08)",
        }}
      >
        <p
          style={{
            color: "#00e5ff",
            letterSpacing: "4px",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          JONAS STREAM
        </p>

        <h1 style={{ fontSize: "48px", marginBottom: "12px" }}>
          Plataforma profesional
        </h1>

        <p style={{ color: "#c7d7e2", marginBottom: "24px", fontSize: "18px" }}>
          Admin, tienda, carrito, pedidos, favoritos y más.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
          }}
        >
          <Link href="/login" style={estiloLink}>Login</Link>
          <Link href="/admin" style={estiloLink}>Admin</Link>
          <Link href="/cliente" style={estiloLink}>Cliente</Link>
          <Link href="/proveedor" style={estiloLink}>Proveedor</Link>
          <Link href="/tienda" style={estiloLink}>Tienda</Link>
          <Link href="/carrito" style={estiloLink}>Carrito</Link>
          <Link href="/favoritos" style={estiloLink}>Favoritos</Link>
        </div>
      </section>
    </main>
  )
}

const estiloLink = {
  display: "block",
  textAlign: "center" as const,
  textDecoration: "none",
  background: "rgba(0,229,255,0.08)",
  color: "#00e5ff",
  border: "1px solid rgba(0,229,255,0.2)",
  borderRadius: "14px",
  padding: "14px 18px",
  fontWeight: "bold",
}