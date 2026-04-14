import Link from "next/link"

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0,229,255,0.08), transparent 20%), #030507",
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
          maxWidth: "1200px",
          background: "rgba(11, 17, 24, 0.88)",
          border: "1px solid rgba(0,229,255,0.18)",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 0 30px rgba(0,229,255,0.08)",
        }}
      >
        <div
          style={{
            position: "relative",
            minHeight: "520px",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "20px",
            padding: "50px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(3,5,7,0.9) 0%, rgba(3,5,7,0.72) 45%, rgba(3,5,7,0.4) 100%)",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            <p
              style={{
                color: "#00e5ff",
                letterSpacing: "4px",
                textTransform: "uppercase",
                marginBottom: "14px",
                fontWeight: "bold",
              }}
            >
              JONAS STREAM
            </p>

            <h1
              style={{
                fontSize: "56px",
                lineHeight: 1.05,
                marginBottom: "16px",
                textShadow: "0 0 18px rgba(0,229,255,0.12)",
              }}
            >
              Accesos premium
              <br />
              en un solo lugar
            </h1>

            <p
              style={{
                color: "#d4e3ee",
                fontSize: "20px",
                lineHeight: 1.6,
                marginBottom: "26px",
                maxWidth: "620px",
              }}
            >
              Streaming, música, VPN, apps y cuentas digitales con una
              experiencia moderna, rápida y profesional.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginBottom: "26px",
              }}
            >
              <Link href="/tienda" style={botonPrincipal}>
                Explorar tienda
              </Link>

              <Link href="/login" style={botonSecundario}>
                Ingresar
              </Link>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span style={chip}>Netflix</span>
              <span style={chip}>Disney+</span>
              <span style={chip}>Spotify</span>
              <span style={chip}>Prime Video</span>
              <span style={chip}>IPTV</span>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "420px",
                height: "420px",
                borderRadius: "50%",
                background: "rgba(0,229,255,0.14)",
                filter: "blur(70px)",
              }}
            />

            <img
              src="/logo-jonas.png"
              alt="JONAS STREAM"
              style={{
                width: "100%",
                maxWidth: "460px",
                objectFit: "contain",
                filter: "drop-shadow(0 0 26px rgba(0,229,255,0.35))",
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: "24px 50px 40px 50px",
            borderTop: "1px solid rgba(0,229,255,0.12)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
          }}
        >
          <Link href="/admin" style={cardLink}>Admin</Link>
          <Link href="/cliente" style={cardLink}>Cliente</Link>
          <Link href="/proveedor" style={cardLink}>Proveedor</Link>
          <Link href="/carrito" style={cardLink}>Carrito</Link>
          <Link href="/favoritos" style={cardLink}>Favoritos</Link>
        </div>
      </section>
    </main>
  )
}

const botonPrincipal = {
  display: "inline-block",
  textDecoration: "none",
  background: "linear-gradient(135deg, #00e5ff, #00bcd4)",
  color: "#001018",
  borderRadius: "14px",
  padding: "14px 22px",
  fontWeight: "bold",
  boxShadow: "0 0 20px rgba(0,229,255,0.25)",
}

const botonSecundario = {
  display: "inline-block",
  textDecoration: "none",
  background: "transparent",
  color: "#00e5ff",
  border: "1px solid rgba(0,229,255,0.28)",
  borderRadius: "14px",
  padding: "14px 22px",
  fontWeight: "bold",
}

const chip = {
  background: "rgba(0,229,255,0.08)",
  color: "#dffcff",
  border: "1px solid rgba(0,229,255,0.16)",
  borderRadius: "999px",
  padding: "8px 14px",
  fontSize: "13px",
}

const cardLink = {
  display: "block",
  textAlign: "center" as const,
  textDecoration: "none",
  background: "rgba(0,229,255,0.06)",
  color: "#00e5ff",
  border: "1px solid rgba(0,229,255,0.16)",
  borderRadius: "14px",
  padding: "14px 18px",
  fontWeight: "bold",
}