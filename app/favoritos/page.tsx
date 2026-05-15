"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { agregarAlCarrito, contarItemsCarrito } from "@/lib/carrito";
import { obtenerFavoritos, toggleFavorito } from "@/lib/favoritos";
import styles from "./favoritos.module.css";

const USD_RATE = 3.75;
const WHATSAPP_NUMBER = "51900557949";

type ProductStatus = "ACTIVO" | "LIMITADO" | "AGOTADO";

type Producto = {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  precio: number | null;
  precio_antes: number | null;
  stock: number | null;
  imagen?: string | null;
  categoria: string | null;
  tipo_venta: string | null;
  whatsapp: string | null;
  estado: string | null;
  publicacion: boolean | null;
  destacado: boolean | null;
  oferta: boolean | null;
  duracion?: string | null;
  proveedor?: string | null;
  renovable?: boolean | null;
  stock_texto?: string | null;
  estado_catalogo?: string | null;
};

type Favorito = {
  producto_id: string;
};

function formatMoney(value: number | null | undefined) {
  return Number(value || 0).toFixed(2);
}

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function normalizeType(value?: string | null) {
  const text = (value || "").toLowerCase();
  if (text.includes("cuenta")) return "Cuenta completa";
  return "Perfil";
}

function normalizeStatus(producto: Producto): ProductStatus {
  const explicit = (producto.estado_catalogo || "").toUpperCase();

  if (explicit === "ACTIVO" || explicit === "LIMITADO" || explicit === "AGOTADO") {
    return explicit;
  }

  if ((producto.estado || "").toLowerCase() === "inactivo") return "AGOTADO";

  const stock = Number(producto.stock || 0);
  if (stock <= 0) return "AGOTADO";
  if (stock <= 3) return "LIMITADO";
  return "ACTIVO";
}

function getStatusClass(status: ProductStatus) {
  if (status === "ACTIVO") return styles.statusActive;
  if (status === "LIMITADO") return styles.statusLimited;
  return styles.statusSoldOut;
}

function getStockClass(status: ProductStatus) {
  if (status === "ACTIVO") return styles.stockActive;
  if (status === "LIMITADO") return styles.stockLimited;
  return styles.stockSoldOut;
}

function getTypeClass(type: string) {
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

export default function FavoritosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarFavoritos();
    setCantidadCarrito(contarItemsCarrito());

    const handleFocus = () => {
      cargarFavoritos();
      setCantidadCarrito(contarItemsCarrito());
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const cargarFavoritos = async () => {
    setCargando(true);

    const favs = (await obtenerFavoritos()) as Favorito[];
    const ids = favs.map((favorito) => favorito.producto_id).filter(Boolean);

    setFavoritos(ids);

    if (ids.length === 0) {
      setProductos([]);
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .in("id", ids)
      .eq("publicacion", true);

    if (error) {
      toast.error("No se pudieron cargar tus favoritos");
      setProductos([]);
    } else {
      const ordenados = ids
        .map((id) => (data || []).find((producto) => producto.id === id))
        .filter(Boolean) as Producto[];

      setProductos(ordenados);
    }

    setCargando(false);
  };

  const manejarFavorito = async (productoId: string) => {
    const estado = await toggleFavorito(productoId);

    if (!estado) {
      setFavoritos((prev) => prev.filter((id) => id !== productoId));
      setProductos((prev) => prev.filter((producto) => producto.id !== productoId));
      toast.success("Producto quitado de favoritos");
      return;
    }

    await cargarFavoritos();
  };

  const comprarProducto = (producto: Producto) => {
    agregarAlCarrito({
      id: producto.id,
      nombre: producto.nombre || "Producto",
      precio: Number(producto.precio || 0),
      imagen: producto.imagen || null,
      categoria: producto.categoria || "",
      tipo_venta: producto.tipo_venta || "",
    });

    setCantidadCarrito(contarItemsCarrito());
    toast.success(`Agregado al carrito: ${producto.nombre || "Producto"}`);
  };

  const totalFavoritos = useMemo(() => productos.length, [productos]);

  return (
    <main className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />

      <div className={styles.sideBrand}>JONAS STREAM</div>
      <div className={`${styles.sideBrand} ${styles.sideBrandRight}`}>JONAS STREAM</div>

      <header className={styles.topbarWrap}>
        <div className={styles.topbar}>
          <Link href="/" className={styles.brandBlock} aria-label="Ir al inicio">
            <strong>JONAS STREAM</strong>
            <span>FAVORITOS</span>
          </Link>

          <div className={styles.topActions}>
            <Link href="/" className={styles.topLink}>
              INICIO
            </Link>

            <Link href="/tienda" className={styles.topLink}>
              TIENDA
            </Link>

            <Link href="/carrito" className={styles.topLink}>
              CARRITO ({cantidadCarrito})
            </Link>

            <a
              href={buildWhatsAppLink("Hola Jonas Stream, quiero más información sobre la tienda.")}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topLinkPrimary}
            >
              CONTÁCTANOS
            </a>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroBadge}>LISTA PERSONAL</div>

        <h1 className={styles.heroTitle}>
          TUS PRODUCTOS
          <span> FAVORITOS</span>
        </h1>

        <p className={styles.heroText}>
          Guarda productos para revisarlos rápido, compararlos y agregarlos al carrito cuando quieras comprar.
        </p>

        <div className={styles.heroActions}>
          <Link href="/tienda" className={styles.heroBtnPrimary}>
            Seguir viendo tienda
          </Link>

          <Link href="/carrito" className={styles.heroBtnSecondary}>
            Ver carrito ({cantidadCarrito})
          </Link>
        </div>
      </section>

      <section className={styles.catalogPanel}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>FAVORITOS GUARDADOS</span>
          <h2 className={styles.sectionTitle}>Productos marcados con corazón</h2>
        </div>

        <div className={styles.resultInfo}>
          {cargando ? (
            "Cargando favoritos..."
          ) : (
            <>
              Mostrando <strong>{totalFavoritos}</strong> favorito(s)
            </>
          )}
        </div>

        {!cargando && productos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>♡</div>
            <h3>No tienes favoritos aún</h3>
            <p>Entra a la tienda y toca el corazón de cualquier producto para guardarlo aquí.</p>
            <Link href="/tienda" className={styles.emptyButton}>
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className={styles.catalogGrid}>
            {productos.map((producto) => {
              const type = normalizeType(producto.tipo_venta);
              const status = normalizeStatus(producto);
              const usd = Number(producto.precio || 0) / USD_RATE;

              return (
                <article key={producto.id} className={styles.productCard}>
                  <button
                    type="button"
                    aria-label="Quitar de favoritos"
                    onClick={() => manejarFavorito(producto.id)}
                    className={`${styles.favoriteButton} ${styles.favoriteActive}`}
                  >
                    ❤️
                  </button>

                  <div className={styles.productBadges}>
                    <span
                      className={`${styles.categoryBadge} ${getCategoryClass(
                        producto.categoria || "Streaming"
                      )}`}
                    >
                      {producto.categoria || "Streaming"}
                    </span>

                    <span className={`${styles.typeBadge} ${getTypeClass(type)}`}>
                      {type === "Perfil" ? "Perfil" : "Cuenta completa"}
                    </span>
                  </div>

                  <div className={styles.productVisual}>
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre || "Producto"}
                        className={styles.productImage}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>Sin imagen</div>
                    )}
                  </div>

                  <div className={styles.productBody}>
                    <h3 className={styles.productTitle}>{producto.nombre || "Producto"}</h3>

                    <p className={styles.productSubtitle}>
                      {producto.descripcion || "Producto digital disponible"}
                    </p>

                    <div className={`${styles.stockBar} ${getStockClass(status)}`}>
                      <span>Stock</span>
                      <strong>{Number(producto.stock || 0)}</strong>
                    </div>

                    <div className={styles.metaGrid}>
                      <div className={styles.metaCard}>
                        <span>TIPO</span>
                        <strong>{type}</strong>
                      </div>

                      <div className={styles.metaCard}>
                        <span>DURACIÓN</span>
                        <strong>{producto.duracion || "1 mes"}</strong>
                      </div>

                      <div className={styles.metaCard}>
                        <span>PROVEEDOR</span>
                        <strong>{producto.proveedor || "Jonas Stream"}</strong>
                      </div>

                      <div className={`${styles.metaCard} ${producto.renovable ?? true ? styles.metaCardSuccess : ""}`}>
                        <span>RENOVABLE</span>
                        <strong>{producto.renovable ?? true ? "Sí" : "No"}</strong>
                      </div>
                    </div>

                    <div className={styles.statusRow}>
                      <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
                        {status}
                      </span>

                      <span className={styles.stockText}>
                        {producto.stock_texto ||
                          (status === "LIMITADO"
                            ? "Stock disponible"
                            : status === "AGOTADO"
                            ? "Consultar reposición"
                            : "Stock disponible")}
                      </span>
                    </div>

                    <div className={styles.priceGrid}>
                      <div className={styles.priceCard}>
                        <small>PEN</small>
                        <strong>S/ {formatMoney(producto.precio)}</strong>
                        {producto.precio_antes ? <em>Antes S/ {formatMoney(producto.precio_antes)}</em> : null}
                      </div>

                      <div className={styles.priceCard}>
                        <small>USD</small>
                        <strong>$ {formatMoney(usd)}</strong>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        onClick={() => comprarProducto(producto)}
                        className={styles.buyButton}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
