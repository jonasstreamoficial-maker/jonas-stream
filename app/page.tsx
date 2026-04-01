import Link from "next/link"

const accesos = [
  { href: "/login", titulo: "Login", descripcion: "Ingresa a tu cuenta" },
  { href: "/admin", titulo: "Admin", descripcion: "Gestiona usuarios, productos y pedidos" },
  { href: "/cliente", titulo: "Cliente", descripcion: "Revisa tus compras y tu cuenta" },
  { href: "/proveedor", titulo: "Proveedor", descripcion: "Consulta información asignada" },
  { href: "/tienda", titulo: "Tienda", descripcion: "Explora productos disponibles" },
  { href: "/carrito", titulo: "Carrito", descripcion: "Revisa tu compra antes de pagar" },
  { href: "/favoritos", titulo: "Favoritos", descripcion: "Guarda tus productos preferidos" },
]

export default function HomePage() {
  return (
    <main style={styles.main}>
      <div style={styles.backgroundGlowTop} />
      <div style={styles.backgroundGlowBottom} />

      <section style={styles.heroCard}>
        <div style={styles.badge}>JONAS STREAM</div>

        <h1 style={styles.title}>
          Plataforma digital profesional para venta de servicios y productos
        </h1>

        <p style={styles.subtitle}>
          Administra usuarios, productos, carrito, favoritos, pedidos y más,
          dentro de una experiencia moderna, elegante y lista para crecer.
        </p>

        <div style={styles.heroButtons}>
          <Link href="/tienda" style={styles.primaryButton}>
            Ir a la tienda
          </Link>

          <Link href="/login" style={styles.secondaryButton}>
            Iniciar sesión
          </Link>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>24/7</span>
            <span style={styles.statLabel}>Acceso a la plataforma</span>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statNumber}>100%</span>
            <span style={styles.statLabel}>Gestión centralizada</span>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statNumber}>Pro</span>
            <span style={styles.statLabel}>Diseño premium neon</span>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionMiniTitle}>ACCESOS RÁPIDOS</p>
          <h2 style={styles.sectionTitle}>Panel principal de navegación</h2>
          <p style={styles.sectionText}>
            Ingresa rápidamente a cada módulo principal del sistema.
          </p>
        </div>

        <div style={styles.grid}>
          {accesos.map((item) => (
            <Link key={item.href} href={item.href} style={styles.cardLink}>
              <div style={styles.cardTopLine} />
              <h3 style={styles.cardTitle}>{item.titulo}</h3>
              <p style={styles.cardDescription}>{item.descripcion}</p>
              <span style={styles.cardAction}>Entrar →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(0,229,255,0.10), transparent 30%), linear-gradient(180deg, #020406 0%, #050912 100%)",
    color: "#ffffff",
    padding: "32px 20px 60px",
    position: "relative",
    overflow: "hidden",
  },

  backgroundGlowTop: {
    position: "absolute",
    top: "-120px",
    left: "-120px",
    width: "300px",
    height: "300px",
    borderRadius: "999px",
    background: "rgba(0,229,255,0.10)",
    filter: "blur(90px)",
    pointerEvents: "none",
  },

  backgroundGlowBottom: {
    position: "absolute",
    bottom: "-120px",
    right: "-120px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(0,229,255,0.08)",
    filter: "blur(100px)",
    pointerEvents: "none",
  },

  heroCard: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1150px",
    margin: "0 auto 38px",
    padding: "50px 32px",
    borderRadius: "28px",
    background: "rgba(8, 13, 20, 0.88)",
    border: "1px solid rgba(0,229,255,0.18)",
    boxShadow: "0 0 35px rgba(0,229,255,0.08)",
    backdropFilter: "blur(10px)",
  },

  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(0,229,255,0.10)",
    border: "1px solid rgba(0,229,255,0.22)",
    color: "#00e5ff",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "3px",
    textTransform: "uppercase",
    marginBottom: "18px",
  },

  title: {
    fontSize: "clamp(34px, 6vw, 62px)",
    lineHeight: 1.05,
    margin: "0 0 16px",
    maxWidth: "900px",
    fontWeight: 800,
  },

  subtitle: {
    fontSize: "18px",
    lineHeight: 1.7,
    color: "#c7d7e2",
    margin: "0 0 28px",
    maxWidth: "760px",
  },

  heroButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "34px",
  },

  primaryButton: {
    textDecoration: "none",
    background: "linear-gradient(135deg, #00e5ff, #00b8d4)",
    color: "#02131a",
    padding: "14px 22px",
    borderRadius: "14px",
    fontWeight: 800,
    boxShadow: "0 0 24px rgba(0,229,255,0.25)",
  },

  secondaryButton: {
    textDecoration: "none",
    background: "rgba(255,255,255,0.03)",
    color: "#dffaff",
    padding: "14px 22px",
    borderRadius: "14px",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.10)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },

  statCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(0,229,255,0.12)",
    borderRadius: "18px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  statNumber: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#00e5ff",
  },

  statLabel: {
    color: "#bdd0dd",
    fontSize: "14px",
  },

  section: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1150px",
    margin: "0 auto",
  },

  sectionHeader: {
    marginBottom: "24px",
  },

  sectionMiniTitle: {
    color: "#00e5ff",
    letterSpacing: "3px",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "8px",
  },

  sectionTitle: {
    fontSize: "32px",
    margin: "0 0 10px",
  },

  sectionText: {
    color: "#b7c9d6",
    margin: 0,
    fontSize: "16px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
  },

  cardLink: {
    position: "relative",
    textDecoration: "none",
    color: "white",
    padding: "22px",
    borderRadius: "22px",
    background: "rgba(10, 16, 25, 0.92)",
    border: "1px solid rgba(0,229,255,0.14)",
    boxShadow: "0 0 18px rgba(0,229,255,0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease",
    display: "block",
  },

  cardTopLine: {
    width: "48px",
    height: "4px",
    borderRadius: "999px",
    background: "#00e5ff",
    marginBottom: "16px",
    boxShadow: "0 0 14px rgba(0,229,255,0.55)",
  },

  cardTitle: {
    margin: "0 0 10px",
    fontSize: "22px",
    fontWeight: 700,
  },

  cardDescription: {
    margin: "0 0 18px",
    color: "#bdd0dd",
    lineHeight: 1.6,
    fontSize: "15px",
  },

  cardAction: {
    color: "#00e5ff",
    fontWeight: 700,
    fontSize: "14px",
  },
}