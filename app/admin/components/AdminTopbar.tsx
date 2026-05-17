import styles from "../admin.module.css"

type TopbarSearchResult = {
  tipo: string
  titulo: string
  detalle: string
  tab: string
}

type AdminTopbarProps = {
  titulo: string
  busquedaGlobal: string
  resultadosGlobales: TopbarSearchResult[]
  ultimaActualizacion: string | null
  onBusquedaGlobalChange: (valor: string) => void
  onSelectResultTab: (tabId: string) => void
  onRefresh: () => void
}

export default function AdminTopbar({
  titulo,
  busquedaGlobal,
  resultadosGlobales,
  ultimaActualizacion,
  onBusquedaGlobalChange,
  onSelectResultTab,
  onRefresh,
}: AdminTopbarProps) {
  return (
    <header className={styles.topbar}>
      <div>
        <p className={styles.kicker}>Control central</p>
        <h2>{titulo}</h2>
        <span>Gestiona ventas, catálogo, usuarios, comprobantes e inventario sin tocar RLS todavía.</span>
      </div>

      <div className={styles.commandCenter}>
        <div className={styles.searchBox}>
          <span>⌘</span>
          <input
            type="search"
            placeholder="Buscar producto, pedido o usuario..."
            value={busquedaGlobal}
            onChange={(e) => onBusquedaGlobalChange(e.target.value)}
          />
          {resultadosGlobales.length > 0 && (
            <div className={styles.searchResults}>
              {resultadosGlobales.map((item, index) => (
                <button
                  key={`${item.tipo}-${item.titulo}-${index}`}
                  type="button"
                  onClick={() => {
                    onSelectResultTab(item.tab)
                    onBusquedaGlobalChange("")
                  }}
                >
                  <span>{item.tipo}</span>
                  <strong>{item.titulo}</strong>
                  <small>{item.detalle}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" onClick={onRefresh} className={styles.refreshButton}>
          Actualizar
        </button>

        {ultimaActualizacion && <div className={styles.topbarPill}>Sync {ultimaActualizacion}</div>}

        <div className={styles.topbarPill}>
          <span className={styles.statusDot}></span>
          Supabase conectado
        </div>
      </div>
    </header>
  )
}
