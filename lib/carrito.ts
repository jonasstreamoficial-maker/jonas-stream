export type ProductoCarrito = {
  id: string
  nombre: string
  precio: number
  imagen?: string | null
  categoria?: string
  tipo_venta?: string
  cantidad: number
}

const CARRITO_KEY = "carrito"

export const obtenerCarrito = (): ProductoCarrito[] => {
  if (typeof window === "undefined") return []

  const carritoGuardado = localStorage.getItem(CARRITO_KEY)
  if (!carritoGuardado) return []

  try {
    return JSON.parse(carritoGuardado)
  } catch {
    return []
  }
}

export const guardarCarrito = (carrito: ProductoCarrito[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito))
}

export const agregarAlCarrito = (producto: Omit<ProductoCarrito, "cantidad">) => {
  const carrito = obtenerCarrito()

  const existente = carrito.find((item) => item.id === producto.id)

  if (existente) {
    existente.cantidad += 1
  } else {
    carrito.push({
      ...producto,
      cantidad: 1,
    })
  }

  guardarCarrito(carrito)
}

export const quitarDelCarrito = (id: string) => {
  const carrito = obtenerCarrito().filter((item) => item.id !== id)
  guardarCarrito(carrito)
}

export const cambiarCantidadCarrito = (id: string, cantidad: number) => {
  const carrito = obtenerCarrito().map((item) =>
    item.id === id
      ? { ...item, cantidad: cantidad < 1 ? 1 : cantidad }
      : item
  )

  guardarCarrito(carrito)
}

export const limpiarCarrito = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem(CARRITO_KEY)
}

export const contarItemsCarrito = (): number => {
  const carrito = obtenerCarrito()
  return carrito.reduce((acc, item) => acc + item.cantidad, 0)
}

export const totalCarrito = (): number => {
  const carrito = obtenerCarrito()
  return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
}