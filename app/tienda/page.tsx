"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { agregarAlCarrito, contarItemsCarrito } from "@/lib/carrito";
import { toggleFavorito, obtenerFavoritos } from "@/lib/favoritos";
import styles from "./tienda.module.css";

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
};

type ConfiguracionTienda = {
  id: string;
  nombre_tienda: string | null;
  slogan: string | null;
  banner_titulo: string | null;
  banner_texto: string | null;
  banner_boton: string | null;
  whatsapp: string | null;
};

type Favorito = {
  producto_id: string;
};

function formatMoney(value: number | null | undefined) {
  return Number(value || 0).toFixed(2);
}

function buildWhatsAppLink(numero: string, mensaje: string) {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
}

export default function TiendaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [config, setConfig] = useState<ConfiguracionTienda | null>(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos");
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    cargarTienda();
    actualizarContador();
    cargarFavoritos();
  }, []);

  const actualizarContador = () => {
    setCantidadCarrito(contarItemsCarrito());
  };

  const cargarFavoritos = async () => {
    const data = await obtenerFavoritos();
    setFavoritos((data as Favorito[]).map((favorito) => favorito.producto_id));
  };

  const manejarFavorito = async (productoId: string) => {
    const estado = await toggleFavorito(productoId);

    setFavoritos((prev) =>
      estado ? [...prev, productoId] : prev.filter((id) => id !== productoId)
    );
  };

  const cargarTienda = async () => {
    setCargando(true);

    const { data: productosData, error: productosError } = await supabase
      .from("productos")
      .select("*")
      .eq("estado", "activo")
      .eq("publicacion", true)
      .order("created_at", { ascending: false });

    const { data: configData } = await supabase
      .from("configuracion_tienda")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (productosError) {
      toast.error("No se pudieron cargar los productos");
    }

    if (productosData) {
      setProductos(productosData as Producto[]);
    }

    if (configData && configData.length > 0) {
      setConfig(configData[0] as ConfiguracionTienda);
    }

    setCargando(false);
  };

  const categoriasUnicas = useMemo(() => {
    return [
      "todos",
      ...Array.from(
        new Set(
          productos
            .map((producto) => producto.categoria || "")
            .filter((categoria) => categoria.trim() !== "")
        )
      ),
    ];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const texto = `${producto.nombre || ""} ${producto.descripcion || ""} ${
        producto.categoria || ""
      } ${producto.tipo_venta || ""}`.toLowerCase();

      const coincideBusqueda = textoBusqueda.length === 0 || texto.includes(textoBusqueda);
      const coincideCategoria =
        categoriaFiltro === "todos" || producto.categoria === categoriaFiltro;

      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoriaFiltro]);

  const comprarProducto = (producto: Producto) => {
    agregarAlCarrito({
      id: producto.id,
      nombre: producto.nombre || "Producto",
      precio: Number(producto.precio || 0),
      imagen: producto.imagen || null,
      categoria: producto.categoria || "",
      tipo_venta: producto.tipo_venta || "",
    });

    actualizarContador();
    toast.success(`Agregado al carrito: ${producto.nombre || "Producto"}`);
  };

  const abrirWhatsApp = (producto: Producto) => {
    const numero = producto.whatsapp || config?.whatsapp || "";

    if (!numero) {
      toast.error("Este producto no tiene WhatsApp configurado");
      return;
    }

    const mensaje = `Hola Jonas Stream, quiero comprar este producto: ${
      producto.nombre || "Producto"
    }.`;
    window.open(buildWhatsAppLink(numero, mensaje), "_blank", "noopener,noreferrer");
  };

  if (cargando) {
    return (
      <main className={styles.page}>
        <div className={styles.bgGlowOne} />
        <div className={styles.bgGlowTwo} />
        <div className={styles.gridOverlay} />

        <section className={styles.loadingBox}>
          <div className={styles.loadingIcon}>⚡</div>
          <p>Cargando tienda...</p>
        </section>
      </main>
    );
  }

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
            <strong>{config?.nombre_tienda || "JONAS STREAM"}</strong>
            <span>{config?.slogan || "TIENDA DIGITAL OFICIAL"}</span>
          </Link>

          <div className={styles.topActions}>
            <Link href="/" className={styles.topLink}>
              INICIO
            </Link>

            <Link href="/ver-precios" className={styles.topLink}>
              VER PRECIOS
            </Link>

            <Link href="/carrito" className={styles.topLinkPrimary}>
              CARRITO ({cantidadCarrito})
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroBadge}>TIENDA OFICIAL</div>

        <h1 className={styles.heroTitle}>
          {config?.banner_titulo || "Tienda digital"}
          <span> Jonas Stream</span>
        </h1>

        <p className={styles.heroText}>
          {config?.banner_texto ||
            "Compra productos digitales, cuentas premium y servicios streaming con atención rápida por carrito o WhatsApp."}
        </p>

        <div className={styles.heroActions}>
          <a href="#productos" className={styles.heroBtnPrimary}>
            {config?.banner_boton || "Comprar ahora"}
          </a>

          <Link href="/carrito" className={styles.heroBtnSecondary}>
            Ver carrito
          </Link>
        </div>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.infoBar}>
          <div className={styles.infoMiniCard}>
            <span>Tienda</span>
            <strong>{config?.nombre_tienda || "Jonas Stream"}</strong>
          </div>

          <div className={styles.infoMiniCard}>
            <span>Productos activos</span>
            <strong>{productos.length}</strong>
          </div>

          <div className={styles.infoMiniCard}>
            <span>Destacados</span>
            <strong>{productos.filter((producto) => producto.destacado).length}</strong>
          </div>
        </div>
      </section>

      <section className={styles.catalogSection} id="productos">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>CATÁLOGO DE COMPRA</span>
          <h2 className={styles.sectionTitle}>Productos disponibles</h2>
          <p className={styles.sectionText}>
            Agrega productos al carrito o consulta disponibilidad directa por WhatsApp.
          </p>
        </div>

        <div className={styles.filterPanel}>
          <div className={styles.searchBox}>
            <span>BUSCAR PRODUCTO</span>
            <input
              type="search"
              placeholder="Ejemplo: Netflix, Canva, IPTV..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <span>CATEGORÍA</span>

            <select
              value={categoriaFiltro}
              onChange={(event) => setCategoriaFiltro(event.target.value)}
            >
              {categoriasUnicas.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria === "todos" ? "Todas las categorías" : categoria}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.resultInfo}>
          Mostrando <strong>{productosFiltrados.length}</strong> producto(s)
        </div>

        {productosFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No hay productos para mostrar</h3>
            <p>Intenta cambiar la búsqueda o la categoría.</p>
          </div>
        ) : (
          <div className={styles.catalogGrid}>
            {productosFiltrados.map((producto) => (
              <article key={producto.id} className={styles.productCard}>
                <button
                  type="button"
                  aria-label="Agregar a favoritos"
                  onClick={() => manejarFavorito(producto.id)}
                  className={`${styles.favoriteButton} ${
                    favoritos.includes(producto.id) ? styles.favoriteActive : ""
                  }`}
                >
                  {favoritos.includes(producto.id) ? "❤️" : "🤍"}
                </button>

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

                  <div className={styles.productBadges}>
                    {producto.destacado && <span className={styles.badgeFeatured}>Destacado</span>}
                    {producto.oferta && <span className={styles.badgeOffer}>Oferta</span>}
                  </div>
                </div>

                <div className={styles.productBody}>
                  <p className={styles.productCategory}>{producto.categoria || "General"}</p>

                  <h3 className={styles.productTitle}>{producto.nombre || "Producto"}</h3>

                  <p className={styles.productSubtitle}>
                    {producto.descripcion || "Producto digital disponible"}
                  </p>

                  <div className={styles.metaRow}>
                    <span>{producto.tipo_venta || "Digital"}</span>
                    <span>Stock: {producto.stock ?? 0}</span>
                  </div>

                  <div className={styles.priceRow}>
                    <strong>S/ {formatMoney(producto.precio)}</strong>

                    {producto.precio_antes &&
                      producto.precio &&
                      producto.precio_antes > producto.precio && (
                        <span>S/ {formatMoney(producto.precio_antes)}</span>
                      )}
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => comprarProducto(producto)}
                      className={styles.buyButton}
                    >
                      Comprar
                    </button>

                    <button
                      type="button"
                      onClick={() => abrirWhatsApp(producto)}
                      className={styles.whatsappButton}
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}