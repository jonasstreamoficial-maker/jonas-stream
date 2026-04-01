import Link from "next/link"
import type { CSSProperties } from "react"

const accesos = [
  {
    href: "/admin",
    titulo: "Panel Admin",
    descripcion: "Control total de usuarios, productos, pedidos y configuración.",
  },
  {
    href: "/tienda",
    titulo: "Tienda",
    descripcion: "Explora productos, categorías, ofertas y experiencia de compra.",
  },
  {
    href: "/cliente",
    titulo: "Panel Cliente",
    descripcion: "Consulta compras, favoritos, pedidos y perfil personal.",
  },
  {
    href: "/proveedor",
    titulo: "Panel Proveedor",
    descripcion: "Visualiza información asignada dentro de la plataforma.",
  },
  {
    href: "/carrito",
    titulo: "Carrito",
    descripcion: "Revisa productos agregados y prepara la compra final.",
  },
  {
    href: "/favoritos",
    titulo: "Favoritos",
    descripcion: "Guarda y recupera productos importantes rápidamente.",
  },
]

const ventajas = [
  "Diseño premium estilo neon / cyber",
  "Base profesional con Next.js + Supabase",
  "Gestión de usuarios, productos y pedidos",
  "Preparado para crecer como negocio real",
]

export default function HomePage() {
  return (
    <main style={styles.page}>
      <div style={styles.bgGrid} />
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />
      <div style={styles.glowThree} />

      <section style={styles.heroWrapper}>
        <div style={styles.heroLeft}>
          <div style={styles.badge}>JONAS STREAM • PLATAFORMA OFICIAL</div>

          <h1 style={styles.title}>
            Vende, administra y escala tu plataforma con una imagen mucho más
            profesional
          </h1>

          <p style={styles.subtitle}>
            Una experiencia moderna para gestionar tienda, usuarios, carrito,
            favoritos, pedidos y paneles internos dentro de una interfaz elegante,
            potente y lista para producción.
          </p>

          <div style={styles.actions}>
            <Link href="/login" style={styles.primaryBtn}>
              Iniciar sesión
            </Link>

            <Link href="/tienda" style={styles.secondaryBtn}>
              Ver tienda
            </Link>
          </div>

          <div style={styles.featureList}>
            {ventajas.map((item) => (
              <div key={item} style={styles.featureItem}>
                <span style={styles.featureDot} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.previewCard}>
            <div style={styles.previewHeader}>
              <div style={styles.previewLights}>
                <span style={styles.lightRed} />
                <span style={styles.lightYellow} />
                <span style={styles.lightGreen} />
              </div>
              <span style={styles.previewTitle}>Dashboard Preview</span>
            </div>

            <div style={styles.previewBody}>
              <div style={styles.statGrid}>
                <div style={styles.statBox}>
                  <span style={styles.statValue}>+120</span>
                  <span style={styles.statLabel}>Usuarios</span>
                </div>

                <div style={styles.statBox}>
                  <span style={styles.statValue}>+48</span>
                  <span style={styles.statLabel}>Productos</span>
                </div>

                <div style={styles.statBox}>
                  <span style={styles.statValue}>+16</span>
                  <span style={styles.statLabel}>Pedidos</span>
                </div>

                <div style={styles.statBox}>
                  <span style={styles.statValue}>99%</span>
                  <span style={styles.statLabel}>Experiencia</span>
                </div>
              </div>

              <div style={styles.miniPanel}>
                <div style={styles.miniPanelTop}>
                  <span style={styles.miniPanelTitle}>Estado del sistema</span>
                  <span style={styles.onlineBadge}>Online</span>
                </div>

                <div style={styles.progressBlock}>
                  <div style={styles.progressLabelRow}>
                    <span>Ventas</span>
                    <span>82%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: "82%" }} />
                  </div>
                </div>

                <div style={styles.progressBlock}>
                  <div style={styles.progressLabelRow}>
                    <span>Actividad</span>
                    <span>91%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: "91%" }} />
                  </div>
                </div>

                <div style={styles.progressBlock}>
                  <div style={styles.progressLabelRow}>
                    <span>Optimización</span>
                    <span>76%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: "76%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.modulesSection}>
        <div style={styles.sectionHead}>
          <p style={styles.sectionMini}>MÓDULOS PRINCIPALES</p>
          <h2 style={styles.sectionTitle}>Accesos rápidos del sistema</h2>
          <p style={styles.sectionText}>
            Navega por cada área importante de tu plataforma desde una portada
            moderna y visualmente fuerte.
          </p>
        </div>

        <div style={styles.cardsGrid}>
          {accesos.map((item) => (
            <Link key={item.href} href={item.href} style={styles.card}>
              <div style={styles.cardLine} />
              <div style={styles.cardIcon}>◆</div>
              <h3 style={styles.cardTitle}>{item.titulo}</h3>
              <p style={styles.cardDesc}>{item.descripcion}</p>
              <span style={styles.cardLink}>Entrar al módulo →</span>
            </Link>
          ))}
        </div>
      </section>

      <section style={styles.bottomBanner}>
        <div style={styles.bottomBannerContent}>
          <p style={styles.bottomMini}>JONAS STREAM</p>
          <h2 style={styles.bottomTitle}>
            Una base más elegante para convertir tu proyecto en producto vendible
          </h2>
          <p style={styles.bottomText}>
            Esta portada está pensada para que tu sistema se vea más premium,
            más serio y más listo para clientes reales.
          </p>

          <div style={styles.bottomButtons}>
            <Link href="/login" style={styles.primaryBtn}>
              Entrar ahora
            </Link>

            <Link href="/admin" style={styles.ghostBtn}>
              Ir al admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at top left, rgba(0,255,247,0.12), transparent 24%), radial-gradient(circle at bottom right, rgba(0,180,255,0.10), transparent 28%), linear-gradient(180deg, #020406 0%, #050814 55%, #020406 100%)",
    color: "#ffffff",
    padding: "40px 20px 80px",
  },

  bgGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 85%)",
    pointerEvents: "none",
  },

  glowOne: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "999px",
    background: "rgba(0,255,247,0.10)",
    filter: "blur(110px)",
    top: "-120px",
    left: "-80px",
    pointerEvents: "none",
  },

  glowTwo: {
    position: "absolute",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(0,140,255,0.12)",
    filter: "blur(100px)",
    top: "120px",
    right: "-100px",
    pointerEvents: "none",
  },

  glowThree: {
    position: "absolute",
    width: "280px",
    height: "280px",
    borderRadius: "999px",
    background: "rgba(0,255,200,0.08)",
    filter: "blur(100px)",
    bottom: "40px",
    left: "25%",
    pointerEvents: "none",
  },

  heroWrapper: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1250px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr",
    gap: "28px",
    alignItems: "center",
  },

  heroLeft: {
    padding: "18px 4px",
  },

  badge: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: "999px",
    border: "1px solid rgba(0,255,247,0.22)",
    background: "rgba(0,255,247,0.08)",
    color: "#89ffff",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "3px",
    marginBottom: "18px",
  },

  title: {
    fontSize: "clamp(38px, 6vw, 72px)",
    lineHeight: 1.02,
    margin: "0 0 18px",
    fontWeight: 900,
    letterSpacing: "-1.5px",
    maxWidth: "760px",
    textShadow: "0 0 24px rgba(0,255,247,0.10)",
  },

  subtitle: {
    margin: "0 0 28px",
    maxWidth: "720px",
    color: "#bfd3de",
    fontSize: "18px",
    lineHeight: 1.75,
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "30px",
  },

  primaryBtn: {
    textDecoration: "none",
    padding: "15px 24px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #00fff7 0%, #00b7ff 100%)",
    color: "#031018",
    fontWeight: 900,
    boxShadow: "0 14px 34px rgba(0,255,247,0.22)",
  },

  secondaryBtn: {
    textDecoration: "none",
    padding: "15px 24px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    color: "#eafcff",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 800,
    backdropFilter: "blur(8px)",
  },

  ghostBtn: {
    textDecoration: "none",
    padding: "15px 24px",
    borderRadius: "16px",
    background: "transparent",
    color: "#89ffff",
    border: "1px solid rgba(0,255,247,0.20)",
    fontWeight: 800,
  },

  featureList: {
    display: "grid",
    gap: "12px",
    maxWidth: "620px",
  },

  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#d7edf4",
    fontSize: "15px",
  },

  featureDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#00fff7",
    boxShadow: "0 0 14px rgba(0,255,247,0.9)",
    flexShrink: 0,
  },

  heroRight: {
    display: "flex",
    justifyContent: "center",
  },

  previewCard: {
    width: "100%",
    maxWidth: "460px",
    borderRadius: "28px",
    background: "rgba(9, 14, 22, 0.86)",
    border: "1px solid rgba(0,255,247,0.16)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.40)",
    overflow: "hidden",
    backdropFilter: "blur(12px)",
  },

  previewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
  },

  previewLights: {
    display: "flex",
    gap: "8px",
  },

  lightRed: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#ff5f57",
  },

  lightYellow: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#febc2e",
  },

  lightGreen: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#28c840",
  },

  previewTitle: {
    fontSize: "13px",
    color: "#9ab4c0",
    fontWeight: 700,
  },

  previewBody: {
    padding: "20px",
  },

  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "14px",
    marginBottom: "18px",
  },

  statBox: {
    borderRadius: "18px",
    padding: "18px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  statValue: {
    fontSize: "28px",
    fontWeight: 900,
    color: "#8affff",
  },

  statLabel: {
    color: "#9fb6c2",
    fontSize: "14px",
  },

  miniPanel: {
    borderRadius: "20px",
    padding: "18px",
    background: "rgba(0,0,0,0.24)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  miniPanelTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  miniPanelTitle: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#e9fbff",
  },

  onlineBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(0,255,170,0.12)",
    color: "#7bffd3",
    fontSize: "12px",
    fontWeight: 800,
    border: "1px solid rgba(0,255,170,0.18)",
  },

  progressBlock: {
    marginBottom: "14px",
  },

  progressLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "13px",
    color: "#a7c0cb",
  },

  progressBar: {
    width: "100%",
    height: "10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #00fff7, #00b7ff)",
    boxShadow: "0 0 12px rgba(0,255,247,0.35)",
  },

  modulesSection: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1250px",
    margin: "70px auto 0",
  },

  sectionHead: {
    marginBottom: "26px",
  },

  sectionMini: {
    color: "#89ffff",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "3px",
    marginBottom: "10px",
  },

  sectionTitle: {
    fontSize: "38px",
    margin: "0 0 10px",
    fontWeight: 900,
  },

  sectionText: {
    color: "#a9bfca",
    fontSize: "16px",
    margin: 0,
    maxWidth: "720px",
    lineHeight: 1.7,
  },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },

  card: {
    textDecoration: "none",
    color: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.30)",
    transition: "all 0.25s ease",
    backdropFilter: "blur(10px)",
    display: "block",
  },

  cardLine: {
    width: "56px",
    height: "4px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #00fff7, #00b7ff)",
    marginBottom: "18px",
    boxShadow: "0 0 14px rgba(0,255,247,0.35)",
  },

  cardIcon: {
    fontSize: "24px",
    color: "#8affff",
    marginBottom: "10px",
  },

  cardTitle: {
    margin: "0 0 10px",
    fontSize: "23px",
    fontWeight: 800,
  },

  cardDesc: {
    margin: "0 0 18px",
    color: "#aac1cc",
    lineHeight: 1.7,
    fontSize: "15px",
  },

  cardLink: {
    color: "#89ffff",
    fontWeight: 800,
    fontSize: "14px",
  },

  bottomBanner: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1250px",
    margin: "70px auto 0",
    borderRadius: "30px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(0,255,247,0.10), rgba(0,80,140,0.18))",
    border: "1px solid rgba(0,255,247,0.14)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
  },

  bottomBannerContent: {
    padding: "40px 28px",
  },

  bottomMini: {
    color: "#89ffff",
    fontSize: "12px",
    letterSpacing: "3px",
    fontWeight: 800,
    marginBottom: "12px",
  },

  bottomTitle: {
    fontSize: "clamp(28px, 4vw, 46px)",
    margin: "0 0 14px",
    fontWeight: 900,
    maxWidth: "900px",
  },

  bottomText: {
    fontSize: "16px",
    color: "#d5ebf3",
    lineHeight: 1.7,
    margin: "0 0 24px",
    maxWidth: "760px",
  },

  bottomButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
  },
}