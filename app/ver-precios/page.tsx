"use client";

import { useMemo, useState } from "react";
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
  type: "Perfil" | "Cuenta completa";
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
    subtitle: "Perfil privado disponible",
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
    subtitle: "Perfil privado disponible",
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
    subtitle: "Cuenta completa disponible",
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
    subtitle: "Perfil privado disponible",
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
    subtitle: "Perfil privado renovable",
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
    subtitle: "Perfil privado disponible",
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
    subtitle: "Perfil privado disponible",
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
    subtitle: "Perfil privado disponible",
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
    subtitle: "Cuenta completa disponible",
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
    subtitle: "Cuenta completa disponible",
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
    subtitle: "Cuenta completa disponible",
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
    subtitle: "Perfil privado disponible",
    type: "Perfil",
    duration: "1 mes",
    provider: "Jonas Stream",
    stockText: "Consultar reposición",
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

function getTypeClass(type: Product["type"]) {
  return type === "Cuenta completa" ? styles.typeAccount : styles.typeProfile;
}

function getCategoryClass(category: string) {
  const key = category.toLowerCase().replace(/\s+/g, "");
  if (key.includes("streaming")) return styles.categoryStreaming;
  if (key.includes("música")) return styles.categoryMusic;
  if (key.includes("video")) return styles.categoryVideo;
  if (key.includes("anime")) return styles.categoryAnime;
  if (key.includes("diseño")) return styles.categoryDesign;
  if (key.includes("oficina")) return styles.categoryOffice;
  if (key.includes("tv")) return styles.categoryTv;
  return styles.categoryDefault;
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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"TODOS" | "Perfil" | "Cuenta completa">("TODOS");
  const [statusFilter, setStatusFilter] = useState<"TODOS" | ProductStatus>("TODOS");

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.subtitle.toLowerCase().includes(normalizedSearch);

      const matchesType = typeFilter === "TODOS" || product.type === typeFilter;
      const matchesStatus = statusFilter === "TODOS" || product.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

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
            <span>LISTADO OFICIAL DE PRECIOS</span>
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
                "Hola, quiero más información sobre los productos y precios de Jonas Stream."
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
          <div className={styles.heroBadge}>CATÁLOGO OFICIAL</div>

          <h1 className={styles.heroTitle}>
            PRECIOS Y PRODUCTOS
            <span> JONAS STREAM</span>
          </h1>

          <p className={styles.heroText}>
            Revisa nuestras plataformas disponibles, tipos de acceso, duración, estado y precios
            referenciales. Elige el producto que necesitas y contáctanos para confirmar stock.
          </p>

          <div className={styles.heroActions}>
            <a href="#catalogo" className={styles.heroBtnPrimary}>
              VER PRODUCTOS
            </a>

            <Link href="/quiero-ser-socio" className={styles.heroBtnSecondary}>
              QUIERO REVENDER
            </Link>
          </div>
        </section>

        <section className={styles.infoSection} aria-label="Filtros de catálogo">
          <div className={styles.filterPanel}>
            <div className={styles.searchBox}>
              <span>BUSCAR PRODUCTOS</span>
              <input
                type="search"
                placeholder="Ejemplo: Netflix, Canva, IPTV..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <span>TIPO DE ACCESO</span>

              <div className={styles.filterButtons}>
                <button
                  type="button"
                  className={typeFilter === "TODOS" ? styles.filterActive : ""}
                  onClick={() => setTypeFilter("TODOS")}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={typeFilter === "Perfil" ? styles.filterActive : ""}
                  onClick={() => setTypeFilter("Perfil")}
                >
                  Perfiles
                </button>
                <button
                  type="button"
                  className={typeFilter === "Cuenta completa" ? styles.filterActive : ""}
                  onClick={() => setTypeFilter("Cuenta completa")}
                >
                  Cuentas completas
                </button>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span>DISPONIBILIDAD</span>

              <div className={styles.filterButtons}>
                <button
                  type="button"
                  className={statusFilter === "TODOS" ? styles.filterActive : ""}
                  onClick={() => setStatusFilter("TODOS")}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={statusFilter === "ACTIVO" ? styles.filterActive : ""}
                  onClick={() => setStatusFilter("ACTIVO")}
                >
                  Activos
                </button>
                <button
                  type="button"
                  className={statusFilter === "LIMITADO" ? styles.filterActive : ""}
                  onClick={() => setStatusFilter("LIMITADO")}
                >
                  Limitados
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.catalogSection} id="catalogo">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>CATÁLOGO DISPONIBLE</span>
            <h2 className={styles.sectionTitle}>Productos, precios y estado actual</h2>
          </div>

          <div className={styles.resultInfo}>
            Mostrando <strong>{filteredProducts.length}</strong> producto(s)
          </div>

          <div className={styles.catalogGrid}>
            {filteredProducts.map((product) => {
              const usd = product.pen / USD_RATE;
return (
                <article
                  key={product.id}
                  className={`${styles.productCard} ${styles[`accent_${product.accent}`]}`}
                >
                  <div className={styles.productTop}>
                    <div className={styles.productBadges}>
                      <span className={`${styles.categoryBadge} ${getCategoryClass(product.category)}`}>
                        {product.category}
                      </span>
                      <span className={`${styles.typeBadge} ${getTypeClass(product.type)}`}>
                        {product.type === "Perfil" ? "Perfil privado" : "Cuenta completa"}
                      </span>
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
</div>
                </article>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              No encontramos productos con ese filtro. Prueba con otro nombre o consulta por WhatsApp.
            </div>
          )}
        </section>

        <section className={styles.bottomSection}>
          <div className={styles.bottomPanel}>
            <span className={styles.sectionKicker}>ATENCIÓN PERSONALIZADA</span>
            <h2 className={styles.sectionTitle}>¿No encuentras lo que buscas?</h2>

            <p className={styles.bottomText}>
              Escríbenos para consultar disponibilidad, promociones del día, cuentas completas,
              perfiles privados o precios especiales para socios revendedores.
            </p>

            <div className={styles.bottomActions}>
              <Link href="/quiero-ser-socio" className={styles.heroBtnSecondary}>
                QUIERO SER SOCIO
              </Link>

              <a
                href={buildWhatsAppLink(
                  "Hola Jonas Stream, quiero activar mi acceso y consultar disponibilidad de productos."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.heroBtnPrimary}
              >
                ACTIVAR MI ACCESO
              </a>
            </div>
          </div>
        </section>

        <footer className={styles.footerWrap}>
          <div className={styles.footerLegal}>
            © 2026 Jonas Stream. Todos los derechos reservados.

            <div className={styles.footerLinks}>
              <Link href="/terminos">Términos y Condiciones</Link>
              <span className={styles.footerSeparator}>•</span>
              <Link href="/privacidad">Política de Privacidad</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}