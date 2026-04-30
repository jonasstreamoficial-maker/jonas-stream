import Link from "next/link";
import styles from "./page.module.css";

const USD_RATE = 3.75;
const WHATSAPP_NUMBER = "51900557949";

type ProductStatus = "ACTIVO" | "LIMITADO" | "AGOTADO";
type ProductAccent =
  | "netflix"
  | "disney"
  | "prime"
  | "max"
  | "spotify"
  | "youtube"
  | "crunchy"
  | "paramount"
  | "canva"
  | "office"
  | "iptv"
  | "viki";

type Product = {
  id: number;
  category: string;
  name: string;
  subtitle: string;
  type: string;
  duration: string;
  provider: string;
  stockText: string;
  status: ProductStatus;
  renewable: boolean;
  pen: number;
  badge: string;
  accent: ProductAccent;
};

const products: Product[] = [
  {
    id: 1,
    category: "Streaming",
    name: "Netflix Premium",
    subtitle: "Perfil privado o compartido",
    type: "Perfil",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    pen: 8,
    badge: "Más vendido",
    accent: "netflix",
  },
  {
    id: 2,
    category: "Streaming",
    name: "Disney+ Premium",
    subtitle: "Acceso estable de alta demanda",
    type: "Perfil",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    pen: 8,
    badge: "Premium",
    accent: "disney",
  },
  {
    id: 3,
    category: "Streaming",
    name: "Prime Video",
    subtitle: "Ideal para reventa por perfiles",
    type: "Cuenta completa",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    pen: 10,
    badge: "Rentable",
    accent: "prime",
  },
  {
    id: 4,
    category: "Streaming",
    name: "Max",
    subtitle: "Plataforma premium de alta rotación",
    type: "Perfil",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Últimas unidades",
    status: "LIMITADO",
    renewable: true,
    pen: 9,
    badge: "Top",
    accent: "max",
  },
  {
    id: 5,
    category: "Música",
    name: "Spotify Premium",
    subtitle: "Acceso individual renovable",
    type: "Perfil",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    pen: 10,
    badge: "Popular",
    accent: "spotify",
  },
  {
    id: 6,
    category: "Video",
    name: "YouTube Premium",
    subtitle: "Sin anuncios y fondo activo",
    type: "Perfil",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    pen: 11,
    badge: "Recomendado",
    accent: "youtube",
  },
  {
    id: 7,
    category: "Anime",
    name: "Crunchyroll",
    subtitle: "Muy buscado por clientes anime",
    type: "Perfil",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    pen: 7,
    badge: "Venta rápida",
    accent: "crunchy",
  },
  {
    id: 8,
    category: "Streaming",
    name: "Paramount+",
    subtitle: "Buen complemento para catálogo",
    type: "Perfil",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    pen: 6,
    badge: "Económico",
    accent: "paramount",
  },
  {
    id: 9,
    category: "Diseño",
    name: "Canva Pro",
    subtitle: "Correo nuevo o renovable",
    type: "Cuenta completa",
    duration: "12 meses",
    provider: "Jonas Stream",
    stockText: "Stock disponible",
    status: "ACTIVO",
    renewable: true,
    pen: 15,
    badge: "Herramienta Pro",
    accent: "canva",
  },
  {
    id: 10,
    category: "Oficina",
    name: "Microsoft 365",
    subtitle: "Licencia anual completa",
    type: "Cuenta completa",
    duration: "12 meses",
    provider: "Jonas Stream",
    stockText: "Stock disponible",
    status: "ACTIVO",
    renewable: false,
    pen: 20,
    badge: "Licencia",
    accent: "office",
  },
  {
    id: 11,
    category: "TV Digital",
    name: "IPTV",
    subtitle: "Canales, series y películas",
    type: "Cuenta completa",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Últimas unidades",
    status: "LIMITADO",
    renewable: true,
    pen: 12,
    badge: "Alto margen",
    accent: "iptv",
  },
  {
    id: 12,
    category: "Streaming",
    name: "Viki Pass",
    subtitle: "Ideal para nicho asiático",
    type: "Perfil",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Sin reposición hoy",
    status: "AGOTADO",
    renewable: false,
    pen: 8,
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

function getStatusClass(status: ProductStatus) {
  if (status === "ACTIVO") return styles.statusActive;
  if (status === "LIMITADO") return styles.statusLimited;
  return styles.statusSoldOut;
}

function getAccentLabel(accent: ProductAccent) {
  switch (accent) {
    case "netflix":
      return "N";
    case "disney":
      return "D+";
    case "prime":
      return "P";
    case "max":
      return "M";
    case "spotify":
      return "S";
    case "youtube":
      return "YT";
    case "crunchy":
      return "C";
    case "paramount":
      return "P+";
    case "canva":
      return "Cv";
    case "office":
      return "365";
    case "iptv":
      return "TV";
    case "viki":
      return "V";
    default:
      return "JS";
  }
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
          <Link href="/" className={styles.brandBlock} aria-label="Ir al inicio">
            <strong>JONAS STREAM</strong>
            <span>Listado Oficial de Precios</span>
          </Link>

          <div className={styles.topActions}>
            <Link href="/" className={styles.topLink}>
              INICIO
            </Link>

            <Link href="/quiero-ser-socio" className={styles.topLink}>
              SER SOCIO
            </Link>

            <a
              href={buildWhatsAppLink(
                "Hola, quiero más información sobre el catálogo de precios de Jonas Stream."
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
            Aquí puedes visualizar productos, tipo de acceso, duración, proveedor, estado y
            precios referenciales en una presentación mucho más elegante y profesional.
          </p>

          <div className={styles.heroActions}>
            <a href="#catalogo" className={styles.heroBtnPrimary}>
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
              <strong>Pro</strong>
              <span>Visual premium y limpio</span>
            </div>
          </div>
        </section>

        <section className={styles.infoSection}>
          <div className={styles.infoBar}>
            <div className={styles.infoMiniCard}>
              <span>CATÁLOGO</span>
              <strong>Solo visualización</strong>
            </div>
            <div className={styles.infoMiniCard}>
              <span>EDICIÓN</span>
              <strong>Fácil de modificar</strong>
            </div>
            <div className={styles.infoMiniCard}>
              <span>ESTILO</span>
              <strong>Premium Jonas Stream</strong>
            </div>
          </div>
        </section>

        <section className={styles.catalogSection} id="catalogo">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>CATÁLOGO DISPONIBLE</span>
            <h2 className={styles.sectionTitle}>Productos, precios y estado actual</h2>
          </div>

          <div className={styles.catalogGrid}>
            {products.map((product) => {
              const usd = product.pen / USD_RATE;

              return (
                <article
                  key={product.id}
                  className={`${styles.productCard} ${styles[`accent_${product.accent}`]}`}
                >
                  <div className={styles.productTop}>
                    <div className={styles.productBadges}>
                      <span className={styles.categoryBadge}>{product.category}</span>
                      <span className={styles.featureBadge}>{product.badge}</span>
                    </div>

                    <div className={styles.productVisual}>
                      <div className={styles.productVisualGlow} />
                      <div className={styles.logoCircle}>{getAccentLabel(product.accent)}</div>
                      <div className={styles.productNameOverlay}>{product.name}</div>
                    </div>
                  </div>

                  <div className={styles.productBody}>
                    <h3 className={styles.productTitle}>{product.name}</h3>
                    <p className={styles.productSubtitle}>{product.subtitle}</p>

                    <div className={styles.metaGrid}>
                      <div className={styles.metaCard}>
                        <span>TIPO</span>
                        <strong>{product.type}</strong>
                      </div>

                      <div className={styles.metaCard}>
                        <span>DURACIÓN</span>
                        <strong>{product.duration}</strong>
                      </div>

                      <div className={styles.metaCard}>
                        <span>PROVEEDOR</span>
                        <strong>{product.provider}</strong>
                      </div>

                      <div className={styles.metaCard}>
                        <span>RENOVABLE</span>
                        <strong>{product.renewable ? "Sí" : "No"}</strong>
                      </div>
                    </div>

                    <div className={styles.statusRow}>
                      <span className={`${styles.statusBadge} ${getStatusClass(product.status)}`}>
                        {product.status}
                      </span>
                      <span className={styles.stockText}>{product.stockText}</span>
                    </div>

                    <div className={styles.priceGrid}>
                      <div className={styles.priceCard}>
                        <small>PEN</small>
                        <strong>S/ {formatMoney(product.pen)}</strong>
                      </div>

                      <div className={styles.priceCard}>
                        <small>USD</small>
                        <strong>$ {formatMoney(usd)}</strong>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.visualTag}>SOLO VISUALIZACIÓN</span>
                      <span className={styles.codeTag}>ID {String(product.id).padStart(2, "0")}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.bottomSection}>
          <div className={styles.bottomPanel}>
            <span className={styles.sectionKicker}>NOTA FINAL</span>
            <h2 className={styles.sectionTitle}>Catálogo editable para tu negocio</h2>

            <p className={styles.bottomText}>
              Todos los productos y precios mostrados aquí son ejemplos. Luego puedes editar
              nombre, costo, duración, proveedor, stock y estado directamente desde el arreglo
              del archivo para adaptarlo a tu operación real.
            </p>

            <div className={styles.bottomActions}>
              <Link href="/quiero-ser-socio" className={styles.heroBtnSecondary}>
                VER PLAN SOCIO
              </Link>

              <a
                href={buildWhatsAppLink(
                  "Hola, quiero ayuda para personalizar la página ver-precios de Jonas Stream."
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