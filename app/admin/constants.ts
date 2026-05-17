import type { TabId } from "./types"
import { fechaISO, sumarDiasISO } from "./utils"

export const USD_RATE = 3.75

export const productoInicial = {
  nombre: "",
  descripcion: "",
  precio: "",
  precio_antes: "",
  stock: "",
  categoria: "",
  tipo_venta: "",
  whatsapp: "",
  estado: "activo",
  publicacion: true,
  destacado: false,
  oferta: false,
  duracion: "1 mes",
  proveedor: "Jonas Stream",
  renovable: true,
  stock_texto: "",
  estado_catalogo: "ACTIVO",
  badge: "",
  accent: "prime",
}

export const configuracionInicial = {
  nombre_tienda: "",
  slogan: "",
  banner_titulo: "",
  banner_texto: "",
  banner_boton: "",
  whatsapp: "",
}

export const crearCuentaInicial = () => ({
  producto_id: "",
  correo: "",
  clave: "",
  fecha_inicio: fechaISO(),
  fecha_fin: sumarDiasISO(30),
  estado: "disponible",
  notas: "",
})

export const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "▣" },
  { id: "productos", label: "Productos", icon: "◈" },
  { id: "pedidos", label: "Pedidos", icon: "◉" },
  { id: "usuarios", label: "Usuarios", icon: "◎" },
  { id: "comprobantes", label: "Comprobantes", icon: "▤" },
  { id: "inventario", label: "Inventario", icon: "▦" },
  { id: "cuentas", label: "Cuentas", icon: "▧" },
  { id: "creditos", label: "Créditos", icon: "✦" },
  { id: "historial", label: "Historial", icon: "◷" },
  { id: "configuracion", label: "Soporte", icon: "✚" },
] as const

export const navGroups: { title: string; items: TabId[] }[] = [
  { title: "Inicio", items: ["dashboard"] },
  { title: "Operación", items: ["pedidos", "comprobantes", "inventario"] },
  { title: "Gestión", items: ["productos", "cuentas", "usuarios", "creditos"] },
  { title: "Sistema", items: ["historial", "configuracion"] },
]

export const estadosPedido = ["todos", "pendiente", "completado", "cancelado"]

export const estadosUsuario = ["todos", "pendiente", "aprobado", "rechazado"]

export const rolesUsuario = ["todos", "cliente", "proveedor", "admin"]

export const etiquetasGoogleContactos = [
  "| ADMIN |",
  "| CV |",
  "| JS |",
  "| RATAS |",
  "| SE |",
  "| SR |",
  "| SV |",
]
