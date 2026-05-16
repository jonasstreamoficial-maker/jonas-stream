"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { agregarAlCarrito, contarItemsCarrito } from "@/lib/carrito";
import { toggleFavorito, obtenerFavoritos } from "@/lib/favoritos";
import { obtenerCreditoUsuario, type CreditoUsuario } from "@/lib/creditos";
import styles from "./tienda.module.css";

const USD_RATE = 3.75;

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

type CartItem = {
  id: string;
  nombre: string;
  precio: number;
  imagen: string | null;
  categoria: string;
  tipo_venta: string;
  cantidad: number;
};

function formatMoney(value: number | null | undefined) {
  return Number(value || 0).toFixed(2);
}

function buildWhatsAppLink(numero: string, mensaje: string) {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
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

function leerCarritoLocal(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const data = window.localStorage.getItem("carrito");
    if (!data) return [];

    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any) => ({
      id: String(item.id),
      nombre: String(item.nombre || item.name || "Producto"),
      precio: Number(item.precio || item.price || 0),
      imagen: item.imagen || item.image || null,
      categoria: String(item.categoria || ""),
      tipo_venta: String(item.tipo_venta || ""),
      cantidad: Number(item.cantidad || item.quantity || 1),
    }));
  } catch {
    return [];
  }
}

function guardarCarritoLocal(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("carrito", JSON.stringify(items));
}

export default function TiendaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [config, setConfig] = useState<ConfiguracionTienda | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [typeFilter, setTypeFilter] = useState<"TODOS" | "Perfil" | "Cuenta completa">("TODOS");
  const [statusFilter, setStatusFilter] = useState<"TODOS" | ProductStatus>("TODOS");
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [creditoUsuario, setCreditoUsuario] = useState<CreditoUsuario | null>(null);

  useEffect(() => {
    cargarTienda();
    actualizarCarrito();
    cargarFavoritos();
    cargarCreditoUsuario();

    const handleFocus = () => {
      actualizarCarrito();
      cargarCreditoUsuario();
    };
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const actualizarCarrito = () => {
    const items = leerCarritoLocal();
    setCartItems(items);
    setCantidadCarrito(contarItemsCarrito());
  };

  const cargarFavoritos = async () => {
    const data = await obtenerFavoritos();
    setFavoritos((data as Favorito[]).map((favorito) => favorito.producto_id));
  };

  const cargarCreditoUsuario = async () => {
    const credito = await obtenerCreditoUsuario();
    setCreditoUsuario(credito);
  };

  const manejarFavorito = async (productoId: string) => {
    try {
      const estado = await toggleFavorito(productoId);

      setFavoritos((prev) =>
        estado ? [...prev, productoId] : prev.filter((id) => id !== productoId)
      );

      toast.success(estado ? "Agregado a favoritos" : "Quitado de favoritos");
    } catch {
      toast.error("No se pudo actualizar favoritos");
    }
  };

  const cargarTienda = async () => {
    const { data: productosData, error: productosError } = await supabase
      .from("productos")
      .select("*")
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
  };

  const productosFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const type = normalizeType(producto.tipo_venta);
      const status = normalizeStatus(producto);

      const texto = `${producto.nombre || ""} ${producto.descripcion || ""} ${
        producto.categoria || ""
      } ${producto.tipo_venta || ""}`.toLowerCase();

      const matchesSearch = textoBusqueda.length === 0 || texto.includes(textoBusqueda);
      const matchesType = typeFilter === "TODOS" || type === typeFilter;
      const matchesStatus = statusFilter === "TODOS" || status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [productos, busqueda, typeFilter, statusFilter]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.precio * item.cantidad, 0);
  }, [cartItems]);

  const cartCantidad = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.cantidad, 0);
  }, [cartItems]);

  const comprarProducto = (producto: Producto) => {
    const status = normalizeStatus(producto);

    if (status === "AGOTADO") {
      toast.error("Este producto está agotado");
      return;
    }

    agregarAlCarrito({
      id: producto.id,
      nombre: producto.nombre || "Producto",
      precio: Number(producto.precio || 0),
      imagen: producto.imagen || null,
      categoria: producto.categoria || "",
      tipo_venta: producto.tipo_venta || "",
    });

    actualizarCarrito();
    toast.success(`Agregado al carrito: ${producto.nombre || "Producto"}`);
  };

  const cambiarCantidad = (productoId: string, cantidad: number) => {
    const actual = leerCarritoLocal();
    const itemActual = actual.find((item) => item.id === productoId);

    const actualizado =
      cantidad <= 0
        ? actual.filter((item) => item.id !== productoId)
        : actual.map((item) => (item.id === productoId ? { ...item, cantidad } : item));

    guardarCarritoLocal(actualizado);
    setCartItems(actualizado);
    setCantidadCarrito(actualizado.reduce((total, item) => total + item.cantidad, 0));

    if (cantidad <= 0 && itemActual) {
      toast.success("Producto quitado del carrito");
    }
  };

  const quitarProducto = (productoId: string) => {
    const actualizado = leerCarritoLocal().filter((item) => item.id !== productoId);
    guardarCarritoLocal(actualizado);
    setCartItems(actualizado);
    setCantidadCarrito(actualizado.reduce((total, item) => total + item.cantidad, 0));
    toast.success("Producto quitado del carrito");
  };

  const limpiarVistaCarrito = () => {
    if (cartItems.length === 0) {
      toast.error("El carrito ya está vacío");
      return;
    }

    guardarCarritoLocal([]);
    setCartItems([]);
    setCantidadCarrito(0);
    toast.success("Carrito limpiado correctamente");
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

            <Link href="/carrito" className={styles.topLink}>
              CARRITO ({cartCantidad || cantidadCarrito})
            </Link>

            <Link href="/favoritos" className={styles.topLink}>
              FAVORITOS ({favoritos.length})
            </Link>

            <a
              href={buildWhatsAppLink(
                config?.whatsapp || "51900557949",
                "Hola Jonas Stream, quiero más información sobre la tienda."
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

      <section className={styles.hero}>
        <div className={styles.heroBadge}>TIENDA OFICIAL</div>

        <h1 className={styles.heroTitle}>
          TIENDA DIGITAL
          <span> JONAS STREAM</span>
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
            Finalizar compra
          </Link>
        </div>
      </section>

      <section className={styles.infoSection} aria-label="Filtros de tienda">
        <div className={styles.filterPanel}>
          <div className={styles.searchBox}>
            <span>BUSCAR PRODUCTOS</span>
            <input
              type="search"
              placeholder="Ejemplo: Netflix, Canva, IPTV..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
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

      <section className={styles.shopSection} id="productos">
        <div className={styles.catalogPanel}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>CATÁLOGO DE COMPRA</span>
            <h2 className={styles.sectionTitle}>Productos disponibles</h2>
          </div>

          <div className={styles.resultInfo}>
            Mostrando <strong>{productosFiltrados.length}</strong> producto(s)
          </div>

          {productosFiltrados.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No hay productos para mostrar</h3>
              <p>Intenta cambiar la búsqueda, el tipo de acceso o la disponibilidad.</p>
            </div>
          ) : (
            <div className={styles.catalogGrid}>
              {productosFiltrados.map((producto) => {
                const type = normalizeType(producto.tipo_venta);
                const status = normalizeStatus(producto);
                const usd = Number(producto.precio || 0) / USD_RATE;

                return (
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
        </div>

        <aside className={styles.cartPanel}>
          <div className={styles.creditMiniPanel}>
            <span>Créditos disponibles</span>
            <strong>S/ {formatMoney(creditoUsuario?.saldo || 0)}</strong>
            <small>
              {creditoUsuario
                ? creditoUsuario.estado === "activo"
                  ? "Puedes pagar desde el carrito si tienes saldo suficiente."
                  : "Tu saldo existe, pero está inactivo."
                : "Inicia sesión para ver tu saldo de créditos."}
            </small>
          </div>

          <div className={styles.cartHeader}>
            <div>
              <span>Carrito</span>
              <h3>Tu compra</h3>
            </div>

            <strong>{cartCantidad}</strong>
          </div>

          {cartItems.length === 0 ? (
            <div className={styles.cartEmpty}>
              <strong>Aún no agregaste productos</strong>
              <p>Presiona “Comprar” en cualquier producto y aparecerá aquí al instante.</p>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.cartImage}>
                      {item.imagen ? <img src={item.imagen} alt={item.nombre} /> : <span>JS</span>}
                    </div>

                    <div className={styles.cartInfo}>
                      <strong>{item.nombre}</strong>
                      <span>{item.tipo_venta || item.categoria || "Producto digital"}</span>

                      <div className={styles.cartControls}>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                        >
                          −
                        </button>

                        <small>{item.cantidad}</small>

                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => quitarProducto(item.id)}
                          className={styles.cartRemove}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>

                    <div className={styles.cartPrice}>
                      S/ {formatMoney(item.precio * item.cantidad)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.cartSummary}>
                <div>
                  <span>Productos</span>
                  <strong>{cartCantidad}</strong>
                </div>

                <div>
                  <span>Total rápido</span>
                  <strong>S/ {formatMoney(cartTotal)}</strong>
                </div>
              </div>

              <div className={styles.cartActions}>
                <Link href="/carrito" className={styles.cartGoTo}>
                  Finalizar compra
                </Link>

                <button type="button" onClick={limpiarVistaCarrito} className={styles.cartContinue}>
                  Vaciar carrito
                </button>
              </div>

              <p className={styles.cartNote}>
                Finaliza en el carrito completo para crear tu pedido, aplicar cupón y confirmar datos.
              </p>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
