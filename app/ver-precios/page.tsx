"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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
  id: string;
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
  image?: string | null;
};

type ProductoDB = {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  precio: number | null;
  stock: number | null;
  imagen?: string | null;
  categoria: string | null;
  tipo_venta: string | null;
  estado: string | null;
  publicacion: boolean | null;
  destacado: boolean | null;
  oferta: boolean | null;
  duracion?: string | null;
  proveedor?: string | null;
  renovable?: boolean | null;
  stock_texto?: string | null;
  estado_catalogo?: ProductStatus | string | null;
  badge?: string | null;
  accent?: ProductAccent | string | null;
};

function formatMoney(value: number) {
  return value.toFixed(2);
}

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function normalizeType(value?: string | null): Product["type"] {
  const text = (value || "").toLowerCase();

  if (text.includes("cuenta")) return "Cuenta completa";

  return "Perfil";
}

function normalizeStatus(product: ProductoDB): ProductStatus {
  const explicit = (product.estado_catalogo || "").toUpperCase();

  if (explicit === "ACTIVO" || explicit === "LIMITADO" || explicit === "AGOTADO") {
    return explicit;
  }

  if ((product.estado || "").toLowerCase() === "inactivo") return "AGOTADO";

  const stock = Number(product.stock || 0);

  if (stock <= 0) return "AGOTADO";
  if (stock <= 3) return "LIMITADO";

  return "ACTIVO";
}

function normalizeAccent(value?: string | null): ProductAccent {
  const accent = (value || "").toLowerCase();

  const valid: ProductAccent[] = [
    "netflix",
    "disney",
    "prime",
    "max",
    "spotify",
    "youtube",
    "crunchy",
    "paramount",
    "canva",
    "office",
    "iptv",
    "viki",
  ];

  if (valid.includes(accent as ProductAccent)) {
    return accent as ProductAccent;
  }

  return "prime";
}

function normalizeProduct(product: ProductoDB): Product {
  const type = normalizeType(product.tipo_venta);
  const status = normalizeStatus(product);
  const stock = Number(product.stock || 0);

  return {
    id: product.id,
    category: product.categoria || "Streaming",
    name: product.nombre || "Producto",
    subtitle:
      product.descripcion ||
      (type === "Perfil" ? "Perfil privado disponible" : "Cuenta completa disponible"),
    type,
    duration: product.duracion || "1 mes",
    provider: product.proveedor || "Jonas Stream",
    stockText:
      product.stock_texto ||
      (status === "AGOTADO"
        ? "Consultar reposición"
        : status === "LIMITADO"
        ? "Últimas unidades"
        : "Stock disponible"),
    status,
    renewable: product.renovable ?? true,
    pen: Number(product.precio || 0),
    badge:
      product.badge ||
      (product.oferta ? "Oferta" : product.destacado ? "Destacado" : stock <= 3 ? "Limitado" : "Disponible"),
    accent: normalizeAccent(product.accent || product.nombre || product.categoria),
    image: product.imagen || null,
  };
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
  if (key.includes("música") || key.includes("musica")) return styles.categoryMusic;
  if (key.includes("video")) return styles.categoryVideo;
  if (key.includes("anime")) return styles.categoryAnime;
  if (key.includes("diseño") || key.includes("diseno")) return styles.categoryDesign;
  if (key.includes("oficina")) return styles.categoryOffice;
  if (key.includes("tv")) return styles.categoryTv;
  return styles.categoryDefault;
}

function getAccentLabel(product: Product) {
  if (product.accent === "disney") return "D+";
  if (product.accent === "youtube") return "YT";
  if (product.accent === "paramount") return "P+";
  if (product.accent === "canva") return "Cv";
  if (product.accent === "office") return "365";
  if (product.accent === "iptv") return "TV";

  return product.name.slice(0, 1).toUpperCase();
}

export default function VerPreciosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"TODOS" | "Perfil" | "Cuenta completa">("TODOS");
  const [statusFilter, setStatusFilter] = useState<"TODOS" | ProductStatus>("TODOS");

  useEffect(() => {
    const cargarProductos = async () => {
      setLoadingProducts(true);

      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("publicacion", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts((data as ProductoDB[]).map(normalizeProduct));
      }

      setLoadingProducts(false);
    };

    cargarProductos();
  }, []);

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
  }, [products, search, typeFilter, statusFilter]);

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
            <Link href="/quiero-ser-socio" className={styles.heroBtnPrimary}>
              QUIERO SER SOCIO
            </Link>

            <a href="#catalogo" className={styles.heroBtnSecondary}>
              VER PRODUCTOS
            </a>
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
            {loadingProducts ? (
              "Cargando productos..."
            ) : (
              <>
                Mostrando <strong>{filteredProducts.length}</strong> producto(s)
              </>
            )}
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

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className={styles.productImage}
                        />
                      ) : (
                        <div className={styles.logoCircle}>{getAccentLabel(product)}</div>
                      )}
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

          {!loadingProducts && filteredProducts.length === 0 && (
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