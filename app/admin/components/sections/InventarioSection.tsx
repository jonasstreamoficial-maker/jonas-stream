"use client"

import type { ComponentType } from "react"
import styles from "../../admin.module.css"

type Producto = {
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

type InventarioSectionProps = {
  productos: Producto[]
  productosAgotados: Producto[]
  productosBajoStock: Producto[]
  saludInventario: number
  productosInventarioFiltrados: Producto[]
  sincronizandoInventario: boolean
  busquedaInventario: string
  filtroInventario: "todos" | "critico" | "agotado" | "bajo" | "estable"
  setBusquedaInventario: (value: string) => void
  setFiltroInventario: (value: "todos" | "critico" | "agotado" | "bajo" | "estable") => void
  setFiltroStockProducto: (value: string) => void
  setTabActiva: (value: string) => void
  sincronizarInventarioAutomatico: () => void
  ajustarStockProducto: (producto: Producto, cantidad: number) => void
  reponerProductoRapido: (producto: Producto, cantidad?: number) => void
  editarProducto: (producto: Producto) => void
  MetricCard: ComponentType<any>
  EmptyState: ComponentType<any>
}

export default function InventarioSection({
  productos,
  productosAgotados,
  productosBajoStock,
  saludInventario,
  productosInventarioFiltrados,
  sincronizandoInventario,
  busquedaInventario,
  filtroInventario,
  setBusquedaInventario,
  setFiltroInventario,
  setFiltroStockProducto,
  setTabActiva,
  sincronizarInventarioAutomatico,
  ajustarStockProducto,
  reponerProductoRapido,
  editarProducto,
  MetricCard,
  EmptyState,
}: InventarioSectionProps) {
  return (
    <div className={styles.sectionStack}>
            <section className={styles.inventoryHeroPro}>
              <div>
                <span className={styles.proTag}>FASE 6 · INVENTARIO AUTO</span>
                <h3>Centro de stock inteligente</h3>
                <p>
                  Controla agotados, bajo stock, reposiciones rápidas y descuento automático al completar pedidos
                  cuando el producto del pedido coincide con el catálogo.
                </p>
              </div>
              <div className={styles.inventoryHeroStats}>
                <button type="button" onClick={() => setFiltroInventario("agotado")}>
                  <strong>{productosAgotados.length}</strong>
                  <span>Agotados</span>
                </button>
                <button type="button" onClick={() => setFiltroInventario("bajo")}>
                  <strong>{productosBajoStock.length}</strong>
                  <span>Bajo stock</span>
                </button>
                <button type="button" onClick={() => setFiltroInventario("estable")}>
                  <strong>{productos.filter((p) => Number(p.stock) > 3).length}</strong>
                  <span>Estables</span>
                </button>
              </div>
            </section>

            <div className={styles.metricsGridCompact}>
              <MetricCard title="Stock estable" value={productos.filter((p) => Number(p.stock) > 3).length} detail="Productos sin alerta" tone="success" />
              <MetricCard title="Bajo stock" value={productosBajoStock.length} detail="1 a 3 unidades" tone="warning" />
              <MetricCard title="Agotados" value={productosAgotados.length} detail="Reponer urgente" tone="danger" />
              <MetricCard title="Salud" value={`${saludInventario}%`} detail="Estado general" tone="info" />
            </div>

            <article className={`${styles.panel} ${styles.autoInventoryPanel} ${styles.autoInventoryPanelPro}`}>
              <div>
                <p className={styles.kicker}>Automatización</p>
                <h3>Inventario automático</h3>
                <p>
                  Sincroniza estados visuales: stock 0 pasa a AGOTADO y se oculta; stock 1-3 pasa a LIMITADO;
                  stock mayor a 3 queda ACTIVO. Al completar pedidos o aprobar comprobantes, el panel descuenta la cantidad comprada por coincidencia de nombre.
                </p>
              </div>
              <div className={styles.autoInventoryActions}>
                <button type="button" disabled={sincronizandoInventario} onClick={sincronizarInventarioAutomatico} className={styles.primaryButton}>
                  {sincronizandoInventario ? "Sincronizando..." : "Sincronizar inventario"}
                </button>
                <button type="button" onClick={() => { setFiltroInventario("critico"); setBusquedaInventario("") }} className={styles.secondaryButton}>Ver críticos</button>
                <button type="button" onClick={() => { setFiltroStockProducto("agotado"); setTabActiva("productos") }} className={styles.dangerButton}>Editar agotados</button>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Operación</p>
                  <h3>Control de inventario</h3>
                  <span className={styles.panelHint}>Filtra, repone, descuenta o edita productos sin salir del módulo.</span>
                </div>
                <span className={styles.countBadge}>{productosInventarioFiltrados.length} productos</span>
              </div>

              <div className={styles.inventoryToolbarPro}>
                <input
                  type="text"
                  placeholder="Buscar producto, categoría o proveedor..."
                  value={busquedaInventario}
                  onChange={(e) => setBusquedaInventario(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.toggleGroup}>
                  <button type="button" onClick={() => setFiltroInventario("critico")} className={filtroInventario === "critico" ? styles.toggleActive : ""}>Críticos</button>
                  <button type="button" onClick={() => setFiltroInventario("agotado")} className={filtroInventario === "agotado" ? styles.toggleActive : ""}>Agotados</button>
                  <button type="button" onClick={() => setFiltroInventario("bajo")} className={filtroInventario === "bajo" ? styles.toggleActive : ""}>Bajo</button>
                  <button type="button" onClick={() => setFiltroInventario("estable")} className={filtroInventario === "estable" ? styles.toggleActive : ""}>Estable</button>
                  <button type="button" onClick={() => setFiltroInventario("todos")} className={filtroInventario === "todos" ? styles.toggleActive : ""}>Todo</button>
                </div>
              </div>

              <div className={styles.inventoryGridPro}>
                {productosInventarioFiltrados.length === 0 ? (
                  <EmptyState title="Sin productos" text="No hay productos que coincidan con el filtro de inventario." />
                ) : productosInventarioFiltrados.map((producto) => {
                  const stock = Number(producto.stock || 0)
                  const esAgotado = stock <= 0
                  const esBajo = stock > 0 && stock <= 3
                  const porcentajeStock = Math.min(100, Math.max(0, (stock / 10) * 100))

                  return (
                    <article key={producto.id} className={`${styles.inventoryCardPro} ${esAgotado ? styles.inventoryCardDanger : esBajo ? styles.inventoryCardWarning : ""}`}>
                      <div className={styles.inventoryCardTop}>
                        <div>
                          <span className={styles.inventoryLabel}>{producto.categoria || "Sin categoría"}</span>
                          <h4>{producto.nombre}</h4>
                          <p>{producto.proveedor || "Jonas Stream"} · {producto.estado_catalogo || "ACTIVO"}</p>
                        </div>
                        <div className={esAgotado ? styles.stockPillDanger : esBajo ? styles.stockPill : styles.stockPillOk}>{stock} und.</div>
                      </div>

                      <div className={styles.stockMeter}>
                        <span style={{ width: `${porcentajeStock}%` }}></span>
                      </div>

                      <div className={styles.inventoryStatusLine}>
                        <strong>{esAgotado ? "Reponer ahora" : esBajo ? "Stock limitado" : "Inventario estable"}</strong>
                        <small>{producto.publicacion ? "Publicado" : "Oculto"}</small>
                      </div>

                      <div className={styles.inventoryQuickActions}>
                        <button type="button" onClick={() => ajustarStockProducto(producto, -1)} className={styles.dangerGhostButton}>-1</button>
                        <button type="button" onClick={() => ajustarStockProducto(producto, 1)} className={styles.secondaryButton}>+1</button>
                        <button type="button" onClick={() => ajustarStockProducto(producto, 5)} className={styles.secondaryButton}>+5</button>
                        <button type="button" onClick={() => reponerProductoRapido(producto, 10)} className={styles.successButton}>+10</button>
                        <button type="button" onClick={() => editarProducto(producto)} className={styles.primaryButton}>Editar</button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </article>
          </div>
  )
}
