import styles from "../../admin.module.css"

type UsuariosSectionProps = {
  title?: string
}

export default function UsuariosSection({ title = "Usuarios" }: UsuariosSectionProps) {
  return (
    <article className={styles.panel}>
      <p className={styles.kicker}>Modulo preparado</p>
      <h3>{title}</h3>
      <p className={styles.panelHint}>
        Este archivo esta listo para la proxima fase, pero aun no esta conectado al AdminPanel.
      </p>
    </article>
  )
}
