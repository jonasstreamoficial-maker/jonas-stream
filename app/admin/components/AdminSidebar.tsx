import styles from "../admin.module.css"

type SidebarUsuario = {
  nombre?: string | null
  correo?: string | null
  rol?: string | null
}

type SidebarTab = {
  id: string
  label: string
  icon: string
}

type SidebarGroup = {
  title: string
  items: readonly string[]
}

type AdminSidebarProps = {
  usuario: SidebarUsuario | null
  tabs: readonly SidebarTab[]
  navGroups: readonly SidebarGroup[]
  tabActiva: string
  badgeByTab?: Record<string, number>
  onSelectTab: (tabId: string) => void
  onLogout: () => void
}

export default function AdminSidebar({
  usuario,
  tabs,
  navGroups,
  tabActiva,
  badgeByTab = {},
  onSelectTab,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandBox}>
        <div className={styles.brandMark}>JS</div>
        <div>
          <p className={styles.brandEyebrow}>Admin panel</p>
          <h1>Jonas Stream</h1>
        </div>
      </div>

      <nav className={styles.nav}>
        {navGroups.map((group) => (
          <div key={group.title} className={styles.navGroup}>
            <p className={styles.navGroupTitle}>{group.title}</p>
            <div className={styles.navGroupItems}>
              {group.items.map((tabId) => {
                const tab = tabs.find((item) => item.id === tabId)
                if (!tab) return null

                const badgeValue = badgeByTab[tab.id] || 0

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`${styles.navButton} ${tabActiva === tab.id ? styles.navButtonActive : ""}`}
                  >
                    <span className={styles.navIcon}>{tab.icon}</span>
                    <strong>{tab.label}</strong>
                    {badgeValue > 0 && <em>{badgeValue}</em>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userMiniCard}>
          <div className={styles.userMiniAvatar}>{usuario?.nombre?.slice(0, 2).toUpperCase() || "JS"}</div>
          <div>
            <p>{usuario?.nombre}</p>
            <span>{usuario?.correo}</span>
          </div>
        </div>
        <div className={styles.sidebarFooterMeta}>
          <div className={styles.rolePill}>{usuario?.rol}</div>
          <div className={styles.sessionPill}>Online</div>
        </div>
        <button type="button" onClick={onLogout} className={styles.logoutButton}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
