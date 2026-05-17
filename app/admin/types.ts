export type Usuario = {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
  pais?: string | null
  codigo_pais?: string | null
  celular?: string | null
  celular_completo?: string | null
}

export type Producto = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precio_antes: number | null
  stock: number
  imagen?: string | null
  categoria: string
  tipo_venta: string
  whatsapp: string
  estado: string
  publicacion: boolean
  destacado: boolean
  oferta: boolean
  duracion?: string | null
  proveedor?: string | null
  renovable?: boolean | null
  stock_texto?: string | null
  estado_catalogo?: string | null
  badge?: string | null
  accent?: string | null
  created_at?: string | null
}

export type Pedido = {
  id: string
  cliente_nombre: string
  cliente_correo: string
  usuario_id?: string | null
  total: number
  estado: string
  metodo_pago: string
  created_at: string
  comprobante_url?: string | null
  comprobante?: string | null
  captura_pago?: string | null
  voucher_url?: string | null
  producto_nombre?: string | null
  cantidad?: number | null
}

export type Comprobante = {
  id: string
  pedido_id?: string | null
  usuario_id?: string | null
  cliente_nombre?: string | null
  cliente_correo?: string | null
  url?: string | null
  archivo_url?: string | null
  imagen_url?: string | null
  comprobante_url?: string | null
  estado?: string | null
  metodo_pago?: string | null
  monto?: number | null
  detalle?: string | null
  created_at?: string | null
}

export type AdminLog = {
  id: string
  accion: string
  entidad: string
  entidad_id?: string | null
  actor_nombre?: string | null
  actor_correo?: string | null
  detalle?: string | null
  created_at: string
}

export type ConfiguracionTienda = {
  id: string
  nombre_tienda: string
  slogan: string
  banner_titulo: string
  banner_texto: string
  banner_boton: string
  whatsapp: string
}

export type Credito = {
  id: string
  usuario_id: string
  saldo: number
  estado: string
  created_at?: string | null
}

export type CuentaProducto = {
  id: string
  producto_id: string
  correo: string
  clave: string
  fecha_inicio?: string | null
  fecha_fin?: string | null
  cliente_inicio?: string | null
  cliente_fin?: string | null
  estado: string
  pedido_id?: string | null
  usuario_id?: string | null
  notas?: string | null
  created_at?: string | null
}

export type ComprobanteUnificado = {
  id: string
  pedidoId?: string | null
  cliente: string
  correo: string
  monto: number
  metodo: string
  estado: string
  url: string | null
  fecha?: string | null
  origen: "tabla" | "pedido"
}

export type MetricTone = "success" | "warning" | "danger" | "info" | "neutral"

export type OrdenProducto = "recientes" | "nombre" | "precio_mayor" | "precio_menor" | "stock_menor"
export type OrdenPedido = "recientes" | "monto_mayor" | "monto_menor"

export type ConfirmacionAdmin = {
  abierta: boolean
  titulo: string
  descripcion: string
  textoConfirmar: string
  tono: "danger" | "success" | "warning"
  onConfirmar: (() => Promise<void> | void) | null
}

export type TabId =
  | "dashboard"
  | "productos"
  | "pedidos"
  | "usuarios"
  | "comprobantes"
  | "inventario"
  | "cuentas"
  | "creditos"
  | "historial"
  | "configuracion"
