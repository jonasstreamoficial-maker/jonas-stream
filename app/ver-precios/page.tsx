"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

const USD_RATE = 3.75;
const WHATSAPP_NUMBER = "51900557949";

type ProductStatus = "ACTIVO" | "LIMITADO" | "AGOTADO";
type ProductType = "Perfil" | "Cuenta completa";
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

type ProductoDB = {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  precio: number | null;
  precio_antes?: number | null;
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
  created_at?: string | null;
};

type Product = {
  id: string;
  category: string;
  name: string;
  subtitle: string;
  type: ProductType;
  duration: string;
  provider: string;
  stock: number;
  stockText: string;
  status: ProductStatus;
  renewable: boolean;
  pen: number;
  beforePrice: number | null;
  badge: string;
  accent: ProductAccent;
  image?: string | null;
  featured: boolean;
  offer: boolean;
  createdAt?: string | null;
};

function formatMoney(value: number) {
  return Number(value || 0).toFixed(2);
}

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function normalizeText(value?: string | number | null) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeType(value?: string | null): ProductType {
  return normalizeText(value).includes("cuenta") ? "Cuenta completa" : "Perfil";
}

function normalizeStatus(product: ProductoDB): ProductStatus {
  const explicit = String(product.estado_catalogo || "").toUpperCase();

  if (explicit === "ACTIVO" || explicit === "LIMITADO" || explicit === "AGOTADO") {
    return explicit;
  }

  if (normalizeText(product.estado) === "inactivo") return "AGOTADO";

  const stock = Number(product.stock || 0);
  if (stock <= 0) return "AGOTADO";
  if (stock <= 3) return "LIMITADO";
  return "ACTIVO";
}

function normalizeAccent(value?: string | null): ProductAccent {
  const text = normalizeText(value);
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

  const direct = valid.find((accent) => text.includes(accent));
  if (direct) return direct;

  if (text.includes("amazon")) return "prime";
  if (text.includes("hbo")) return "max";
  if (text.includes("365") || text.includes("microsoft")) return "office";
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
    stock,
    stockText:
      product.stock_texto ||
      (status === "AGOTADO"
        ? "Consultar reposición"
        : status === "LIMITADO"
        ? "Stock disponible"
        : "Stock disponible"),
    status,
    renewable: product.renovable ?? true,
    pen: Number(product.precio || 0),
    beforePrice: product.precio_antes ? Number(product.precio_antes) : null,
    badge:
      product.badge ||
      (product.oferta ? "Oferta" : product.destacado ? "Destacado" : status === "LIMITADO" ? "Limitado" : "Disponible"),
    accent: normalizeAccent(product.accent || product.nombre || product.categoria),
    image: product.imagen || null,
    featured: Boolean(product.destacado),
    offer: Boolean(product.oferta),
    createdAt: product.created_at,
  };
}

function getStatusClass(status: ProductStatus) {
  if (status === "ACTIVO") return styles.statusActive;
  if (status === "LIMITADO") return styles.statusLimited;
  return styles.statusSoldOut;
}

function getTypeClass(type: ProductType) {
  return type === "Cuenta completa" ? styles.typeAccount : styles.typeProfile;
}

function getAccentLabel(product: Product) {
  if (product.accent === "disney") return "D+";
  if (product.accent === "youtube") return "YT";
  if (product.accent === "paramount") return "P+";
  if (product.accent === "canva") return "CV";
  if (product.accent === "office") return "365";
  if (product.accent === "iptv") return "TV";
  return product.name.slice(0, 2).toUpperCase();
}

export default function VerPreciosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"TODOS" | ProductType>("TODOS");
  const [statusFilter, setStatusFilter] = useState<"TODOS" | ProductStatus>("TODOS");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("publicacion", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts((data as ProductoDB[]).map(normalizeProduct));
      setLastUpdate(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }));
    }

    setLoadingProducts(false);
  };

  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel("jonas-stream-ver-precios-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "productos" }, () => {
        loadProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const metrics = useMemo(() => {
    const active = products.filter((product) => product.status === "ACTIVO").length;
    const limited = products.filter((product) => product.status === "LIMITADO").length;
    const accounts = products.filter((product) => product.type === "Cuenta completa").length;
    const offers = products.filter((product) => product.offer || product.featured).length;

    return { active, limited, accounts, offers };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return products.filter((product) => {
      const searchable = normalizeText(
        `${product.name} ${product.category} ${product.subtitle} ${product.provider} ${product.type}`
      );
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesType = typeFilter === "TODOS" || product.type === typeFilter;
      const matchesStatus = statusFilter === "TODOS" || product.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [products, search, typeFilter, statusFilter]);

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <header className={styles.topbar}>
        <Link href="/" className={styles.brandBox} aria-label="Ir al inicio">
          <span className={styles.brandMark}>JS</span>
          <span>
            <small>Catálogo oficial</small>
            <strong>Jonas Stream</strong>
          </span>
        </Link>

        <nav className={styles.topActions} aria-label="Navegación principal">
          <Link href="/" className={styles.secondaryButton}>Inicio</Link>
          <Link href="/quiero-ser-socio" className={styles.secondaryButton}>Ser socio</Link>
          <a
            href={buildWhatsAppLink("Hola, quiero más información sobre los productos y precios de Jonas Stream.")}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryButton}
          >
            WhatsApp
          </a>
        </nav>
      </header>

      <section className={styles.heroPanel}>
        <div>
          <p className={styles.kicker}>Vista sincronizada con admin</p>
          <h1>Precios y productos Jonas Stream</h1>
          <p>
            Catálogo visual conectado a la tabla productos. Las imágenes, stock, tipo, duración,
            proveedor, estado, oferta y publicación se muestran con el mismo estilo de la edición admin.
          </p>
          <div className={styles.heroActions}>
            <a href="#catalogo" className={styles.primaryButton}>Ver catálogo</a>
            <button type="button" onClick={loadProducts} className={styles.secondaryButton}>
              {loadingProducts ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        <aside className={styles.heroStatusCard}>
          <span>Catálogo activo</span>
          <strong>{products.length}</strong>
          <p>{lastUpdate ? `Última sincronización ${lastUpdate}` : "Sincronizando con Supabase"}</p>
        </aside>
      </section>

      <section className={styles.metricsGrid} aria-label="Resumen del catálogo">
        <button type="button" onClick={() => setStatusFilter("ACTIVO")} className={styles.metricCard}>
          <span>Activos</span><strong>{metrics.active}</strong><small>Publicados</small>
        </button>
        <button type="button" onClick={() => setStatusFilter("LIMITADO")} className={`${styles.metricCard} ${styles.metricWarning}`}>
          <span>Limitados</span><strong>{metrics.limited}</strong><small>Bajo stock</small>
        </button>
        <button type="button" onClick={() => setTypeFilter("Cuenta completa")} className={styles.metricCard}>
          <span>Cuentas</span><strong>{metrics.accounts}</strong><small>Completas</small>
        </button>
        <button type="button" onClick={() => { setSearch(""); setTypeFilter("TODOS"); setStatusFilter("TODOS"); }} className={styles.metricCard}>
          <span>Ofertas</span><strong>{metrics.offers}</strong><small>Destacados</small>
        </button>
      </section>

      <section className={styles.panel} aria-label="Filtros de catálogo">
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.kicker}>Filtros</p>
            <h2>Buscar producto</h2>
            <span>Filtra por nombre, plataforma, proveedor, tipo o estado.</span>
          </div>
          <span className={styles.countBadge}>{filteredProducts.length} producto(s)</span>
        </div>

        <div className={styles.filtersGrid}>
          <input
            type="search"
            placeholder="Buscar Netflix, Canva, IPTV..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={styles.input}
          />

          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "TODOS" | ProductType)} className={styles.input}>
            <option value="TODOS">Todos los tipos</option>
            <option value="Perfil">Perfiles</option>
            <option value="Cuenta completa">Cuentas completas</option>
          </select>

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "TODOS" | ProductStatus)} className={styles.input}>
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="LIMITADO">Limitados</option>
            <option value="AGOTADO">Agotados</option>
          </select>

          <button type="button" onClick={() => { setSearch(""); setTypeFilter("TODOS"); setStatusFilter("TODOS"); }} className={styles.secondaryButton}>
            Limpiar
          </button>
        </div>
      </section>

      <section className={styles.panel} id="catalogo">
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.kicker}>Catálogo visual</p>
            <h2>Productos, precios y stock</h2>
            <span>Tarjetas estilo admin con imagen completa y datos sincronizados.</span>
          </div>
          <span className={styles.countBadge}>{loadingProducts ? "Cargando" : `${filteredProducts.length} visibles`}</span>
        </div>

        {loadingProducts ? (
          <div className={styles.catalogGrid}>
            {Array.from({ length: 8 }).map((_, index) => (
              <article key={index} className={`${styles.storePreviewCard} ${styles.skeletonCard}`}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineSmall} />
              </article>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>No encontramos productos con esos filtros.</div>
        ) : (
          <div className={styles.catalogGrid}>
            {filteredProducts.map((product) => {
              const usd = product.pen / USD_RATE;
              const whatsappMessage = `Hola Jonas Stream, quiero consultar disponibilidad de ${product.name} (${product.type}) por S/ ${formatMoney(product.pen)}.`;

              return (
                <article key={product.id} className={`${styles.storePreviewCard} ${styles[`accent_${product.accent}`] || ""}`}>
                  <div className={styles.previewBadgeRow}>
                    <span className={styles.adminCategoryBadge}>{product.category}</span>
                    <span className={`${styles.adminTypeBadge} ${getTypeClass(product.type)}`}>
                      {product.type}
                    </span>
                  </div>

                  <a
                    href={buildWhatsAppLink(whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.previewFavorite}
                    aria-label={`Consultar ${product.name} por WhatsApp`}
                  >
                    ♥
                  </a>

                  <div className={styles.previewImageBox}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className={styles.previewImage} />
                    ) : (
                      <div className={styles.previewNoImage}>{getAccentLabel(product)}</div>
                    )}
                  </div>

                  <div className={styles.previewBody}>
                    <h3>{product.name}</h3>
                    <p>{product.subtitle}</p>

                    <div className={styles.stockBar}>
                      <span>Stock</span>
                      <strong>{product.stock}</strong>
                    </div>

                    <div className={styles.adminMetaGrid}>
                      <div className={styles.adminMetaCard}>
                        <span>Tipo</span>
                        <strong>{product.type}</strong>
                      </div>
                      <div className={styles.adminMetaCard}>
                        <span>Duración</span>
                        <strong>{product.duration}</strong>
                      </div>
                      <div className={styles.adminMetaCard}>
                        <span>Proveedor</span>
                        <strong>{product.provider}</strong>
                      </div>
                      <div className={`${styles.adminMetaCard} ${product.renewable ? styles.adminMetaSuccess : ""}`}>
                        <span>Renovable</span>
                        <strong>{product.renewable ? "Sí" : "No"}</strong>
                      </div>
                    </div>

                    <div className={styles.adminStatusRow}>
                      <span className={`${styles.statusBadge} ${getStatusClass(product.status)}`}>{product.status}</span>
                      <span>{product.stockText}</span>
                    </div>

                    <div className={styles.adminPriceGrid}>
                      <div className={styles.adminPriceCard}>
                        <small>PEN</small>
                        <strong>S/ {formatMoney(product.pen)}</strong>
                        {product.beforePrice ? <em>Antes S/ {formatMoney(product.beforePrice)}</em> : null}
                      </div>
                      <div className={styles.adminPriceCard}>
                        <small>USD</small>
                        <strong>$ {formatMoney(usd)}</strong>
                      </div>
                    </div>

                    <a
                      href={buildWhatsAppLink(whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.consultButton}
                    >
                      Consultar disponibilidad
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={`${styles.panel} ${styles.bottomPanel}`}>
        <p className={styles.kicker}>Atención personalizada</p>
        <h2>¿Quieres activar o revender?</h2>
        <p>
          Escríbenos para confirmar stock, promociones del día, cuentas completas, perfiles privados
          o condiciones para socios revendedores.
        </p>
        <div className={styles.heroActions}>
          <Link href="/quiero-ser-socio" className={styles.secondaryButton}>Quiero ser socio</Link>
          <a
            href={buildWhatsAppLink("Hola Jonas Stream, quiero activar mi acceso y consultar disponibilidad de productos.")}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryButton}
          >
            Activar mi acceso
          </a>
        </div>
      </section>

      <footer className={styles.footerWrap}>
        © 2026 Jonas Stream. Todos los derechos reservados.
      </footer>
    </main>
  );
}
