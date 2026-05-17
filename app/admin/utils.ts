import type { Comprobante, Pedido } from "./types"

export const normalizarTexto = (valor?: string | number | null) => String(valor ?? "").trim().toLowerCase()
export const limpiarNumeroContacto = (valor?: string | null) => String(valor ?? "").replace(/[^\d]/g, "")
export const separarNombreContacto = (nombreCompleto?: string | null) => {
  const partes = String(nombreCompleto ?? "").trim().split(/\s+/).filter(Boolean)
  return {
    nombre: partes[0] || "",
    segundoNombre: partes.slice(1).join(" "),
  }
}
export const escaparCSV = (valor?: string | number | null) => {
  const texto = String(valor ?? "")
  return `"${texto.replace(/"/g, '""')}"`
}
export const descargarArchivoTexto = (nombreArchivo: string, contenido: string, tipo = "text/csv;charset=utf-8;") => {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nombreArchivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
export const formatearSoles = (valor: number) => `S/ ${Number(valor || 0).toFixed(2)}`
export const fechaLegible = (fecha?: string | null) => {
  if (!fecha) return "Sin fecha"
  const date = new Date(fecha)
  if (Number.isNaN(date.getTime())) return "Sin fecha"
  return date.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })
}
export const fechaISO = (fecha = new Date()) => fecha.toISOString().slice(0, 10)
export const sumarDiasISO = (dias: number, base = new Date()) => {
  const fecha = new Date(base)
  fecha.setDate(fecha.getDate() + dias)
  return fechaISO(fecha)
}
export const fechaCorta = (fecha?: string | null) => {
  if (!fecha) return "Sin fecha"
  const date = new Date(`${fecha}T00:00:00`)
  if (Number.isNaN(date.getTime())) return "Sin fecha"
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
}
export const diasRestantes = (fecha?: string | null) => {
  if (!fecha) return null
  const fin = new Date(`${fecha}T00:00:00`)
  if (Number.isNaN(fin.getTime())) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)
  return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}
export const obtenerEstadoStockVisual = (stockValor: number) => {
  const stock = Math.max(0, Number(stockValor || 0))

  if (stock <= 0) {
    return { label: "AGOTADO", detalle: "Consultar reposición", tono: "danger" as const }
  }

  if (stock <= 3) {
    return { label: "LIMITADO", detalle: "Últimas unidades", tono: "warning" as const }
  }

  return { label: "ACTIVO", detalle: "Stock disponible", tono: "success" as const }
}

export const obtenerComprobanteUrl = (item: Pedido | Comprobante) => {
  const posibleComprobante = item as Partial<Pedido & Comprobante>

  return (
    posibleComprobante.url ||
    posibleComprobante.archivo_url ||
    posibleComprobante.imagen_url ||
    posibleComprobante.comprobante_url ||
    posibleComprobante.comprobante ||
    posibleComprobante.captura_pago ||
    posibleComprobante.voucher_url ||
    null
  )
}