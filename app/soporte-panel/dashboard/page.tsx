export default function SoporteDashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(1, 231, 239, 0.18), transparent 35%), linear-gradient(135deg, #000000, #031316, #071B1E)",
        color: "#ECFFFF",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            color: "#01E7EF",
            letterSpacing: "0.16em",
            fontWeight: 800,
            fontSize: "13px",
          }}
        >
          JONAS STREAM · SOPORTE PANEL
        </p>

        <h1
          style={{
            fontSize: "52px",
            margin: "12px 0",
          }}
        >
          Dashboard de soporte
        </h1>

        <p
          style={{
            color: "#9BC8CB",
            maxWidth: "620px",
            lineHeight: 1.7,
          }}
        >
          Aquí se administrarán clientes, correos asignados, mensajes recibidos,
          renovaciones, vencimientos y alertas de Telegram.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "18px",
            marginTop: "36px",
          }}
        >
          {[
            ["Clientes activos", "0"],
            ["Clientes vencidos", "0"],
            ["Correos asignados", "0"],
            ["Mensajes recibidos", "0"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                border: "1px solid rgba(1, 231, 239, 0.18)",
                background: "rgba(3, 19, 22, 0.78)",
                borderRadius: "22px",
                padding: "24px",
                boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
              }}
            >
              <p style={{ color: "#9BC8CB", margin: 0 }}>{label}</p>
              <strong
                style={{
                  display: "block",
                  color: "#01E7EF",
                  fontSize: "38px",
                  marginTop: "12px",
                }}
              >
                {value}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}