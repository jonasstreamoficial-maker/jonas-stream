import Link from "next/link";
import styles from "./editor-web.module.css";

const editablePages = [
  {
    title: "Portada",
    description:
      "Edita textos, botones, beneficios, redes, legales y vista previa de la página principal.",
    href: "/admin/editor-web/portada",
    status: "Activo",
  },
  {
    title: "Registro",
    description:
      "Preparado para editar título, textos de ayuda, banner y mensajes del registro.",
    href: "#",
    status: "Próximo",
  },
  {
    title: "Tienda",
    description:
      "Preparado para editar encabezados, banners, textos comerciales y avisos de tienda.",
    href: "#",
    status: "Próximo",
  },
  {
    title: "Soporte",
    description:
      "Preparado para editar mensajes de soporte, WhatsApp, Telegram y textos de atención.",
    href: "#",
    status: "Próximo",
  },
  {
    title: "Quiero ser socio",
    description:
      "Preparado para editar beneficios, requisitos, textos y llamadas a la acción.",
    href: "#",
    status: "Próximo",
  },
  {
    title: "Legales",
    description:
      "Preparado para editar términos, condiciones y política de privacidad.",
    href: "#",
    status: "Próximo",
  },
];

export default function EditorWebPage() {
  return (
    <main className={styles.editorShell}>
      <section className={styles.editorTopbar}>
        <div>
          <p className={styles.kicker}>JONAS STREAM</p>
          <h1>Editor Web</h1>
          <p>
            Administra textos, imágenes, enlaces y contenido visual de las páginas públicas sin cargar el panel principal.
          </p>
        </div>

        <Link href="/admin" className={styles.secondaryButton}>
          Volver al admin
        </Link>
      </section>

      <section className={styles.editorNotice}>
        <strong>Orden de trabajo:</strong> primero activaremos la portada con vista previa. Luego conectaremos las demás páginas públicas.
      </section>

      <section className={styles.pageGrid} aria-label="Páginas editables">
        {editablePages.map((page) => {
          const isActive = page.status === "Activo";

          const cardContent = (
            <article className={`${styles.pageCard} ${isActive ? styles.activeCard : ""}`}>
              <div className={styles.cardHeader}>
                <h2>{page.title}</h2>
                <span>{page.status}</span>
              </div>
              <p>{page.description}</p>
              <div className={styles.cardAction}>{isActive ? "Abrir editor" : "Pendiente"}</div>
            </article>
          );

          return isActive ? (
            <Link href={page.href} key={page.title} className={styles.cardLink}>
              {cardContent}
            </Link>
          ) : (
            <div key={page.title} className={styles.cardLink} aria-disabled="true">
              {cardContent}
            </div>
          );
        })}
      </section>
    </main>
  );
}
