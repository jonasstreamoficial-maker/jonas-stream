import Link from "next/link";
import styles from "./page.module.css";

const USD_RATE = 3.75;
const WHATSAPP_NUMBER = "51900557949";

type Product = {
  id: number;
  category: string;
  name: string;
  subtitle: string;
  type: string;
  duration: string;
  stock: string;
  status: "ACTIVO" | "LIMITADO" | "AGOTADO";
  renewable: boolean;
  provider: string;
  pen: number;
  usd: number;
  badge: string;
  accent: string;
};

const products: Product[] = [
  {
    id: 1,
    category: "STREAMING",
    name: "Netflix Premium",
    subtitle: "Perfil privado o compartido",
    type: "Perfil",
    duration: "1 mes",
    stock: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    provider: "Jonas Stream",
    pen: 8,
    usd: 8 / USD_RATE,
    badge: "Más vendido",
    accent: "netflix",
  },
  {
    id: 2,
    category: "STREAMING",
    name: "Disney+ Premium",
    subtitle: "Acceso estable de alta demanda",
    type: "Perfil",
    duration: "1 mes",
    stock: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    provider: "Jonas Stream",
    pen: 8,
    usd: 8 / USD_RATE,
    badge: "Premium",
    accent: "disney",
  },
  {
    id: 3,
    category: "STREAMING",
    name: "Prime Video",
    subtitle: "Ideal para reventa por perfiles",
    type: "Cuenta completa",
    duration: "1 mes",
    stock: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    provider: "Jonas Stream",
    pen: 10,
    usd: 10 / USD_RATE,
    badge: "Rentable",
    accent: "prime",
  },
  {
    id: 4,
    category: "STREAMING",
    name: "Max",
    subtitle: "Plataforma premium de alta rotación",
    type: "Perfil",
    duration: "1 mes",
    stock: "Últimas unidades",
    status: "LIMITADO",
    renewable: true,
    provider: "Jonas Stream",
    pen: 9,
    usd: 9 / USD_RATE,
    badge: "Top",
    accent: "max",
  },
  {
    id: 5,
    category: "MÚSICA",
    name: "Spotify Premium",
    subtitle: "Acceso individual",
    type: "Perfil",
    duration: "1 mes",
    stock: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    provider: "Jonas Stream",
    pen: 10,
    usd: 10 / USD_RATE,
    badge: "Popular",
    accent: "spotify",
  },
  {
    id: 6,
    category: "VIDEO",
    name: "YouTube Premium",
    subtitle: "Sin anuncios y reproducción en segundo plano",
    type: "Perfil",
    duration: "1 mes",
    stock: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    provider: "Jonas Stream",
    pen: 11,
    usd: 11 / USD_RATE,
    badge: "Recomendado",
    accent: "youtube",
  },
  {
    id: 7,
    category: "ANIME",
    name: "Crunchyroll",
    subtitle: "Muy buscado por clientes anime",
    type: "Perfil",
    duration: "1 mes",
    stock: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    provider: "Jonas Stream",
    pen: 7,
    usd: 7 / USD_RATE,
    badge: "Venta rápida",
    accent: "crunchy",
  },
  {
    id: 8,
    category: "STREAMING",
    name: "Paramount+",
    subtitle: "Buen complemento para catálogo",
    type: "Perfil",
    duration: "1 mes",
    stock: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    provider: "Jonas Stream",
    pen: 6,
    usd: 6 / USD_RATE,
    badge: "Económico",
    accent: "paramount",
  },
  {
    id: 9,
    category: "DISEÑO",
    name: "Canva Pro",
    subtitle: "Correo nuevo o acceso renovable",
    type: "Cuenta completa",
    duration: "12 meses",
    stock: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    provider: "Jonas Stream",
    pen: 15,
    usd: 15 / USD_RATE,
    badge: "Herramienta pro",
    accent: "canva",
  },
  {
    id: 10,
    category: "OFICINA",
    name: "Microsoft 365",
    subtitle: "Licencia anual",
    type: "Cuenta completa",
    duration: "12 meses",
    stock: "Stock disponible",
    status: "ACTIVO",
    renewable: false,
    provider: "Jonas Stream",
    pen: 20,
    usd: 20 / USD_RATE,
    badge: "Licencia",
    accent: "office",
  },
  {
    id: 11,
    category: "TV DIGITAL",
    name: "IPTV",
    subtitle: "Canales + películas + series",
    type: "Cuenta completa",
    duration: "1 mes",
    stock: "Últimas unidades",
    status: "LIMITADO",
    renewable: true,
    provider: "Jonas Stream",
    pen: 12,
    usd: 12 / USD_RATE,
    badge: "Alto margen",
    accent: "iptv",
  },
  {
    id: 12,
    category: "STREAMING",
    name: "Viki Pass",
    subtitle: "Ideal para nicho asiático",
    type: "Perfil",
    duration: "1 mes",
    stock: "Sin reposición hoy",
    status: "AGOTADO",
    renewable: false,
    provider: "Jonas Stream",
    pen: 8,
    usd: 8 / USD_RATE,
    badge: "Consultar",
    accent: "viki",
  },
];

function formatMoney(value: number) {
  return value.toFixed(2);
}

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getStatusClass(status: Product["status"]) {
  if (status === "ACTIVO") return styles.active;
  if (status === "LIMITADO") return styles.limited;
  return styles.soldOut;
}

export default function VerPreciosPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />

      <div className={styles.sideBrand}>JONAS STREAM</div>
      <div className={`${styles.sideBrand} ${styles.sideBrandRight}`}>JONAS STREAM</div>

      <header className={styles.topbarWrap}>
        <div className={styles.topbar}>
          <div className={styles.brandBlock}>
            <strong>JONAS STREAM</strong>
            <span>LISTADO OFICIAL DE PRECIOS</span>
          </div>

          <div className={styles.topActions}>
            <Link href="/" className={styles.topLink}>
              VOLVER AL INICIO
            </Link>

            <Link href="/quiero-ser-socio" className={styles.topLink}>
              QUIERO SER SOCIO
            </Link>

            <a
              href={buildWhatsAppLink(
                "Hola, quiero más información sobre el listado de precios de Jonas Stream."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topLinkPrimary}
            >
              CONTÁCTANOS
            </a>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>CATÁLOGO VISUAL PREMIUM</div>

          <h1 className={styles.heroTitle}>
            LISTADO OFICIAL DE
            <span> PRECIOS JONAS STREAM</span>
          </h1>

          <p className={styles.heroText}>
            Explora nuestro catálogo visual de plataformas, licencias y accesos premium.
            Aquí puedes ver ejemplos de precios, tipo de acceso, duración, stock y estado
            actual del producto. Todo con un estilo premium, limpio y profesional.
          </p>

          <div className={styles.heroActions}>
            <a
              href="#catalogo"
              className={styles.heroBtnPrimary}
            >
              VER CATÁLOGO
            </a>

            <Link href="/quiero-ser-socio" className={styles.heroBtnSecondary}>
              QUIERO REVENDER
            </Link>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStatCard}>
              <strong>+12</strong>
              <span>Productos ejemplo</span>
            </div>
            <div className={styles.heroStatCard}>
              <strong>PEN + USD</strong>
              <span>Doble precio visible</span>
            </div>
            <div className={styles.heroStatCard}>
              <strong>Stock</strong>
              <span>Activo, limitado o agotado</span>
            </div>
            <div className={styles.heroStatCard}>
              <strong>Visual Pro</strong>
              <span>Solo exhibición premium</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>VISTA GENERAL</span>
            <h2 className={styles.sectionTitle}>Información rápida del catálogo</h2>
          </div>

          <div className={styles.infoGrid}>
            <article className={styles.infoCard}>
              <h3>Solo visualización</h3>
              <p>
                Este listado está pensado para mostrar productos, tipos de acceso, duración,
                stock y precios de forma clara y elegante.
              </p>
            </article>

            <article className={styles.infoCard}>
              <h3>Fácil de editar</h3>
              <p>
                Luego puedes cambiar nombres, precios, estados, plataformas y categorías
                directamente desde el arreglo de productos.
              </p>
            </article>

            <article className={styles.infoCard}>
              <h3>Diseño premium</h3>
              <p>
                Mantiene el ADN visual de Jonas Stream con paneles glass, glow cyan,
                contraste oscuro y tarjetas modernas.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.section} id="catalogo">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>CATÁLOGO DISPONIBLE</span>
            <h2 className={styles.sectionTitle}>Productos, precios y estado actual</h2>
          </div>

          <div className={styles.catalogGrid}>
            {products.map((product) => (
              <article
                key={product.id}
                className={`${styles.productCard} ${styles[product.accent]}`}
              >
                <div className={styles.cardVisual}>
                  <div className={styles.visualGlow} />
                  <div className={styles.cardCategory}>{product.category}</div>
                  <div className={styles.cardBadge}>{product.badge}</div>
                  <div className={styles.cardLogoWrap}>
                    <div className={styles.cardLogoText}>{product.name}</div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{product.name}</h3>
                  <p className={styles.cardSubtitle}>{product.subtitle}</p>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span>TIPO</span>
                      <strong>{product.type}</strong>
                    </div>

                    <div className={styles.metaItem}>
                      <span>DURACIÓN</span>
                      <strong>{product.duration}</strong>
                    </div>

                    <div className={styles.metaItem}>
                      <span>PROVEEDOR</span>
                      <strong>{product.provider}</strong>
                    </div>

                    <div className={styles.metaItem}>
                      <span>RENOVABLE</span>
                      <strong>{product.renewable ? "Sí" : "No"}</strong>
                    </div>
                  </div>

                  <div className={styles.stockRow}>
                    <div className={`${styles.statusBadge} ${getStatusClass(product.status)}`}>
                      {product.status}
                    </div>
                    <span className={styles.stockText}>{product.stock}</span>
                  </div>

                  <div className={styles.priceRow}>
                    <div className={styles.priceBox}>
                      <span>PEN</span>
                      <strong>S/ {formatMoney(product.pen)}</strong>
                    </div>

                    <div className={styles.priceBox}>
                      <span>USD</span>
                      <strong>$ {formatMoney(product.usd)}</strong>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.visualOnlyTag}>SOLO VISUALIZACIÓN</span>
                    <span className={styles.codeTag}>ID {String(product.id).padStart(2, "0")}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>NOTA</span>
            <h2 className={styles.sectionTitle}>Catálogo editable para tu negocio</h2>
          </div>

          <div className={styles.bottomPanel}>
            <p>
              Todos los precios mostrados aquí son de ejemplo y puedes modificarlos cuando
              quieras. También puedes cambiar stock, estado, duración, proveedor y tipo de
              acceso según tu operación real.
            </p>

            <div className={styles.bottomActions}>
              <Link href="/quiero-ser-socio" className={styles.heroBtnSecondary}>
                VER PLAN SOCIO
              </Link>

              <a
                href={buildWhatsAppLink(
                  "Hola, quiero ayuda para personalizar mi página de ver precios de Jonas Stream."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.heroBtnPrimary}
              >
                PEDIR PERSONALIZACIÓN
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}