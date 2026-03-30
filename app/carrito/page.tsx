"use client"

import Link from "next/link"
import { useEffect, useState, type CSSProperties } from "react"
import {
  obtenerCarrito,
  quitarDelCarrito,
  cambiarCantidadCarrito,
  limpiarCarrito,
  totalCarrito,
  type ProductoCarrito,
} from "@/lib/carrito"
import { crearPedido } from "@/lib/pedidos"
import { validarCupon } from "@/lib/cupones"
import toast from "react-hot-toast"

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([])
  const [procesandoPedido, setProcesandoPedido] = useState(false)
  const [codigoCupon, setCodigoCupon] = useState("")
  const [descuento, setDescuento] = useState(0)
  const [cuponAplicado, setCuponAplicado] = useState<string | null>(null)

  const cargarCarrito = () => {
    setCarrito(obtenerCarrito())
  }

  useEffect(() => {
    cargarCarrito()
  }, [])

  const aumentarCantidad = (id: string, cantidadActual: number) => {
    cambiarCantidadCarrito(id, cantidadActual + 1)
    cargarCarrito()
  }

  const disminuirCantidad = (id: string, cantidadActual: number) => {
    cambiarCantidadCarrito(id, cantidadActual - 1)
    cargarCarrito()
  }

  const eliminarProducto = (id: string) => {
    quitarDelCarrito(id)
    cargarCarrito()
  }

  const vaciarCarrito = () => {
    const confirmar = confirm("¿Seguro que quieres vaciar el carrito?")
    if (!confirmar) return

    limpiarCarrito()
    cargarCarrito()
    setCodigoCupon("")
    setDescuento(0)
    setCuponAplicado(null)
  }

  const aplicarCupon = async () => {
    if (!codigoCupon) {
      toast.error("Ingresa un cupón")
      return
    }

    const data = await validarCupon(codigoCupon)

    if (!data) {
      toast.error("Cupón inválido o inactivo")
      return
    }

    setDescuento(data.descuento)
    setCuponAplicado(data.codigo)

    toast.success(`Cupón aplicado: ${data.descuento}%`)
  }

  const finalizarCompra = async () => {
    try {
      setProcesandoPedido(true)
      const pedido = await crearPedido("pendiente")
      toast.success(`Pedido creado correctamente. ID: ${pedido.id}`)
      cargarCarrito()
      setCodigoCupon("")
      setDescuento(0)
      setCuponAplicado(null)
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "Ocurrió un error al crear el pedido"
      toast.error(mensaje)
    } finally {
      setProcesandoPedido(false)
    }
  }

  const totalOriginal = totalCarrito()
  const totalFinal = totalOriginal - (totalOriginal * descuento) / 100

  return (
    <main style={estilos.main}>
      <div style={estilos.fondoGlow}></div>

      <section style={estilos.header}>
        <div>
          <p style={estilos.miniMarca}>JONAS STREAM</p>
          <h1 style={estilos.titulo}>Tu carrito</h1>
          <p style={estilos.subtexto}>Revisa tus productos seleccionados</p>
        </div>

        <div style={estilos.accionesHeader}>
          <Link href="/tienda" style={estilos.botonSecundario}>
            Volver a tienda
          </Link>

          {carrito.length > 0 && (
            <button onClick={vaciarCarrito} style={estilos.botonEliminar}>
              Vaciar carrito
            </button>
          )}
        </div>
      </section>

      {carrito.length === 0 ? (
        <section style={estilos.vacio}>
          <h2 style={{ marginBottom: "10px" }}>Tu carrito está vacío</h2>
          <p style={{ color: "#c2d1dc", marginBottom: "18px" }}>
            Agrega productos desde la tienda para continuar
          </p>

          <Link href="/tienda" style={estilos.botonPrincipal}>
            Ir a la tienda
          </Link>
        </section>
      ) : (
        <section style={estilos.gridPrincipal}>
          <div style={estilos.lista}>
            {carrito.map((producto) => (
              <div key={producto.id} style={estilos.cardProducto}>
                <div style={estilos.imagenWrap}>
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      style={estilos.imagen}
                    />
                  ) : (
                    <div style={estilos.imagenPlaceholder}>Sin imagen</div>
                  )}
                </div>

                <div style={estilos.info}>
                  <p style={estilos.categoria}>{producto.categoria || "General"}</p>
                  <h3 style={estilos.nombre}>{producto.nombre}</h3>
                  <p style={estilos.tipo}>{producto.tipo_venta || "Digital"}</p>
                  <p style={estilos.precio}>S/ {producto.precio}</p>

                  <div style={estilos.controlCantidad}>
                    <button
                      onClick={() => disminuirCantidad(producto.id, producto.cantidad)}
                      style={estilos.botonCantidad}
                    >
                      -
                    </button>

                    <span style={estilos.cantidadTexto}>{producto.cantidad}</span>

                    <button
                      onClick={() => aumentarCantidad(producto.id, producto.cantidad)}
                      style={estilos.botonCantidad}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={estilos.columnaFinal}>
                  <p style={estilos.subtotal}>
                    S/ {(producto.precio * producto.cantidad).toFixed(2)}
                  </p>

                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    style={estilos.botonEliminar}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside style={estilos.resumen}>
            <h2 style={estilos.resumenTitulo}>Resumen</h2>

            <div style={estilos.resumenFila}>
              <span>Productos</span>
              <span>{carrito.length}</span>
            </div>

            <div style={estilos.resumenFila}>
              <span>Unidades</span>
              <span>
                {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
              </span>
            </div>

            <div style={estilos.linea}></div>

            <div style={estilos.resumenFila}>
              <span>Subtotal</span>
              <span>S/ {totalOriginal.toFixed(2)}</span>
            </div>

            {descuento > 0 && (
              <div style={{ ...estilos.resumenFila, color: "#00ffcc" }}>
                <span>Descuento ({descuento}%)</span>
                <span>- S/ {((totalOriginal * descuento) / 100).toFixed(2)}</span>
              </div>
            )}

            <div style={estilos.linea}></div>

            <div style={estilos.totalFila}>
              <span>Total</span>
              <span>S/ {totalFinal.toFixed(2)}</span>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <input
                type="text"
                placeholder="Código de cupón"
                value={codigoCupon}
                onChange={(e) => setCodigoCupon(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "8px",
                  border: "1px solid rgba(0,229,255,0.18)",
                  background: "#081018",
                  color: "white",
                  outline: "none",
                }}
              />

              <button
                onClick={aplicarCupon}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  background: "#00e5ff",
                  color: "#000",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Aplicar cupón
              </button>

              {cuponAplicado && (
                <p style={{ color: "#00ffcc", marginTop: "6px" }}>
                  Cupón aplicado: {cuponAplicado}
                </p>
              )}
            </div>

            <button
              style={estilos.botonPrincipal}
              onClick={finalizarCompra}
              disabled={procesandoPedido}
            >
              {procesandoPedido ? "Procesando pedido..." : "Crear pedido"}
            </button>
          </aside>
        </section>
      )}
    </main>
  )
}

const estilos: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(0,229,255,0.08), transparent 25%), #030507",
    color: "white",
    position: "relative",
    overflow: "hidden",
    padding: "40px 24px 60px 24px",
  },
  fondoGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(circle at 15% 15%, rgba(0,251,255,0.06), transparent 22%), radial-gradient(circle at 85% 10%, rgba(0,229,255,0.05), transparent 20%)",
  },
  header: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1200px",
    margin: "0 auto 30px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  miniMarca: {
    color: "#00e5ff",
    letterSpacing: "4px",
    fontSize: "14px",
    textTransform: "uppercase",
    marginBottom: "12px",
  },
  titulo: {
    fontSize: "44px",
    marginBottom: "8px",
  },
  subtexto: {
    color: "#c7d7e2",
  },
  accionesHeader: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  vacio: {
    position: "relative",
    zIndex: 1,
    maxWidth: "900px",
    margin: "0 auto",
    background: "rgba(11, 17, 24, 0.9)",
    border: "1px solid rgba(0,229,255,0.18)",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
  },
  gridPrincipal: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.8fr) minmax(280px, 0.8fr)",
    gap: "22px",
  },
  lista: {
    display: "grid",
    gap: "18px",
  },
  cardProducto: {
    background: "rgba(11, 17, 24, 0.9)",
    border: "1px solid rgba(0,229,255,0.18)",
    borderRadius: "20px",
    padding: "18px",
    display: "grid",
    gridTemplateColumns: "140px 1fr auto",
    gap: "18px",
    alignItems: "center",
  },
  imagenWrap: {
    width: "140px",
    height: "140px",
    borderRadius: "16px",
    overflow: "hidden",
    background: "#081018",
    border: "1px solid rgba(0,229,255,0.15)",
  },
  imagen: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imagenPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#91a6b5",
    fontSize: "14px",
  },
  info: {
    minWidth: 0,
  },
  categoria: {
    color: "#8fc9d4",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "6px",
  },
  nombre: {
    fontSize: "28px",
    marginBottom: "8px",
  },
  tipo: {
    color: "#c7d7e2",
    marginBottom: "10px",
  },
  precio: {
    color: "#00f7ff",
    fontWeight: "bold",
    fontSize: "28px",
    marginBottom: "12px",
  },
  controlCantidad: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  botonCantidad: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    border: "1px solid rgba(0,229,255,0.3)",
    background: "transparent",
    color: "#00e5ff",
    fontWeight: "bold",
    fontSize: "18px",
    cursor: "pointer",
  },
  cantidadTexto: {
    minWidth: "26px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "18px",
  },
  columnaFinal: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "12px",
  },
  subtotal: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "24px",
  },
  resumen: {
    background: "rgba(11, 17, 24, 0.92)",
    border: "1px solid rgba(0,229,255,0.18)",
    borderRadius: "20px",
    padding: "22px",
    height: "fit-content",
    position: "sticky",
    top: "24px",
  },
  resumenTitulo: {
    fontSize: "24px",
    marginBottom: "18px",
    color: "#00e5ff",
  },
  resumenFila: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    color: "#c7d7e2",
  },
  linea: {
    height: "1px",
    background: "rgba(0,229,255,0.12)",
    margin: "18px 0",
  },
  totalFila: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  botonPrincipal: {
    display: "inline-block",
    width: "100%",
    textAlign: "center",
    background: "#00e5ff",
    color: "#001018",
    textDecoration: "none",
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 18px rgba(0,229,255,0.22)",
  },
  botonSecundario: {
    display: "inline-block",
    textAlign: "center",
    background: "transparent",
    color: "#00e5ff",
    textDecoration: "none",
    border: "1px solid rgba(0,229,255,0.34)",
    borderRadius: "14px",
    padding: "12px 16px",
    fontWeight: "bold",
  },
  botonEliminar: {
    background: "rgba(255, 80, 80, 0.12)",
    color: "#ff9a9a",
    border: "1px solid rgba(255, 120, 120, 0.3)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
}