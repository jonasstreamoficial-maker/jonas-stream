"use client"

import styles from "../../admin.module.css"

type CuentasSectionProps = Record<string, any>

export default function CuentasSection({
  cuentasProducto,
  cuentasEntregadas,
  cuentasDisponibles,
  cuentasPorVencer,
  cuentasBloqueadas,
  editandoCuentaId,
  formCuenta,
  guardarCuenta,
  handleCuentaChange,
  productos,
  guardandoCuenta,
  limpiarFormularioCuenta,
  exportarCuentasCSV,
  exportarRespaldoCuentas,
  inputImportarCuentasRef,
  handleArchivoImportacionChange,
  handleDropImportacion,
  archivoImportacionNombre,
  textoImportacionCuentas,
  importarCuentasDesdeTXT,
  importandoCuentas,
  limpiarArchivoImportacion,
  productoCuentasActivo,
  setProductoCuentasActivoId,
  setBusquedaCuenta,
  setFiltroEstadoCuenta,
  resumenCuentasPorProducto,
  resumenCuentasActivo,
  busquedaCuenta,
  filtroEstadoCuenta,
  cuentasDetalleProducto,
  obtenerUsuarioPorId,
  diasRestantes,
  fechaCorta,
  normalizarTexto,
  copiarDatosCuenta,
  renovarCuentaCliente,
  quitarAccesoCuenta,
  cambiarEstadoCuentaOperativa,
  editarCuenta,
  eliminarCuenta,
  MetricCard,
  EmptyState
}: CuentasSectionProps) {
  return (
          <div className={styles.sectionStack}>
            <section className={styles.metricsGridCompact}>
              <MetricCard title="Cuentas" value={cuentasProducto.length} detail={`${cuentasEntregadas} entregadas`} tone="info" />
              <MetricCard title="Disponibles" value={cuentasDisponibles} detail="Listas para entregar" tone="success" />
              <MetricCard title="Por vencer" value={cuentasPorVencer} detail="Vencen en 7 días" tone="warning" />
              <MetricCard title="Bloqueadas" value={cuentasBloqueadas} detail="No vender / vencidas" tone="danger" />
            </section>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Banco de cuentas completas</p>
                  <h3>{editandoCuentaId ? "Editar cuenta" : "Agregar cuenta completa"}</h3>
                  <span className={styles.panelHint}>
                    Las fechas se crean automáticamente: inicio hoy y finalización en 30 días. Puedes editarlas si necesitas.
                  </span>
                </div>
                {editandoCuentaId && <span className={styles.editBadge}>Modo edición</span>}
              </div>

              <form onSubmit={guardarCuenta} className={styles.formGrid}>
                <select
                  name="producto_id"
                  value={formCuenta.producto_id}
                  onChange={handleCuentaChange}
                  className={styles.input}
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map((producto: any) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>

                <select
                  name="estado"
                  value={formCuenta.estado}
                  onChange={handleCuentaChange}
                  className={styles.input}
                >
                  <option value="disponible">Disponible</option>
                  <option value="entregada">Entregada</option>
                  <option value="bloqueada">Bloqueada</option>
                  <option value="vencida">Vencida</option>
                </select>

                <input
                  name="correo"
                  type="email"
                  placeholder="Correo de la cuenta"
                  value={formCuenta.correo}
                  onChange={handleCuentaChange}
                  className={styles.input}
                />

                <input
                  name="clave"
                  type="text"
                  placeholder="Contraseña"
                  value={formCuenta.clave}
                  onChange={handleCuentaChange}
                  className={styles.input}
                />

                <label className={styles.dateFieldLabel}>
                  <span>Fecha inicio</span>
                  <input
                    name="fecha_inicio"
                    type="date"
                    value={formCuenta.fecha_inicio}
                    onChange={handleCuentaChange}
                    className={styles.input}
                  />
                </label>

                <label className={styles.dateFieldLabel}>
                  <span>Fecha fin automática (+30 días)</span>
                  <input
                    name="fecha_fin"
                    type="date"
                    value={formCuenta.fecha_fin}
                    onChange={handleCuentaChange}
                    className={styles.input}
                  />
                </label>

                <textarea
                  name="notas"
                  placeholder="Notas internas opcionales"
                  value={formCuenta.notas}
                  onChange={handleCuentaChange}
                  className={`${styles.input} ${styles.textarea}`}
                />

                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryButton} disabled={guardandoCuenta}>
                    {guardandoCuenta ? "Guardando..." : editandoCuentaId ? "Actualizar cuenta" : "Guardar cuenta"}
                  </button>
                  {editandoCuentaId && (
                    <button type="button" className={styles.secondaryButton} onClick={limpiarFormularioCuenta}>
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Importación y respaldo</p>
                  <h3>Importar cuentas por archivo TXT</h3>
                  <span className={styles.panelHint}>Arrastra tu archivo .txt con una cuenta por línea. Formato: correo1@gmail.com:123456</span>
                </div>
                <div className={styles.tableActions}>
                  <button type="button" onClick={() => exportarCuentasCSV(false)} className={styles.secondaryButton}>Exportar CSV</button>
                  <button type="button" onClick={() => exportarCuentasCSV(true)} className={styles.secondaryButton}>Exportar filtradas</button>
                  <button type="button" onClick={exportarRespaldoCuentas} className={styles.successButton}>Respaldo cuentas</button>
                </div>
              </div>

              <div className={styles.noticeBox}>
                Primero selecciona arriba el producto, fechas, estado y notas. Luego arrastra tu TXT. Ejemplo: correo1@gmail.com:123456. El sistema omite duplicadas del mismo producto.
              </div>

              <input
                ref={inputImportarCuentasRef}
                type="file"
                accept=".txt,text/plain"
                onChange={handleArchivoImportacionChange}
                className={styles.hiddenFileInput}
              />

              <div
                className={styles.importDropzone}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropImportacion}
                onClick={() => inputImportarCuentasRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") inputImportarCuentasRef.current?.click()
                }}
              >
                <div className={styles.importDropIcon}>TXT</div>
                <div>
                  <strong>{archivoImportacionNombre || "Arrastra aquí tu archivo de cuentas"}</strong>
                  <p>Formato: correo1@gmail.com:123456 · correo2@gmail.com:clave456</p>
                  <small>{textoImportacionCuentas ? `${textoImportacionCuentas.split(/\r?\n/).filter((linea: string) => linea.trim()).length} línea(s) listas para importar` : "Click para seleccionar archivo .txt"}</small>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={importarCuentasDesdeTXT} disabled={importandoCuentas || guardandoCuenta || !textoImportacionCuentas.trim()} className={styles.primaryButton}>
                  {importandoCuentas ? "Importando..." : "Importar cuentas TXT"}
                </button>
                <button type="button" onClick={limpiarArchivoImportacion} className={styles.secondaryButton}>
                  Limpiar archivo
                </button>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Control de cuentas por plataforma</p>
                  <h3>{productoCuentasActivo ? `Cuentas de ${productoCuentasActivo.nombre}` : "Resumen de cuentas"}</h3>
                  <span className={styles.panelHint}>
                    {productoCuentasActivo
                      ? "Aquí ves solo las cuentas de esta plataforma: clientes asignados, vigencias, estado y acciones."
                      : "Primero ves el resumen por producto. Entra a una plataforma para ver clientes y cuentas sin hacer una lista infinita."}
                  </span>
                </div>

                {productoCuentasActivo && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setProductoCuentasActivoId(null)}
                  >
                    ← Volver al resumen
                  </button>
                )}
              </div>

              {!productoCuentasActivo && (
                resumenCuentasPorProducto.length === 0 ? (
                  <EmptyState title="Sin cuentas" text="Agrega tus primeras cuentas completas para ordenar el stock real." />
                ) : (
                  <div className={styles.accountSummaryGrid}>
                    {resumenCuentasPorProducto.map((item: any) => (
                      <button
                        key={item.producto.id}
                        type="button"
                        className={`${styles.accountPlatformCard} ${
                          item.disponibles <= 0
                            ? styles.accountPlatformDanger
                            : item.disponibles <= 3
                            ? styles.accountPlatformWarning
                            : styles.accountPlatformSuccess
                        }`}
                        onClick={() => {
                          setProductoCuentasActivoId(item.producto.id)
                          setBusquedaCuenta("")
                          setFiltroEstadoCuenta("todos")
                        }}
                      >
                        <div className={styles.accountPlatformTop}>
                          <div>
                            <span>{item.producto.categoria || "Plataforma"}</span>
                            <strong>{item.producto.nombre}</strong>
                          </div>
                          <em>{item.total}</em>
                        </div>

                        <div className={styles.accountPlatformStats}>
                          <div>
                            <b>{item.disponibles}</b>
                            <small>Disponibles</small>
                          </div>
                          <div>
                            <b>{item.entregadas}</b>
                            <small>Ocupadas</small>
                          </div>
                          <div>
                            <b>{item.bloqueadas}</b>
                            <small>Bloqueadas</small>
                          </div>
                          <div>
                            <b>{item.porVencer}</b>
                            <small>Por vencer</small>
                          </div>
                        </div>

                        <div className={styles.accountPlatformFooter}>
                          <span>Stock tienda: {item.producto.stock}</span>
                          <strong>Gestionar cuentas →</strong>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}

              {productoCuentasActivo && (
                <>
                  <div className={styles.accountDetailHero}>
                    <div>
                      <p className={styles.kicker}>Plataforma seleccionada</p>
                      <h4>{productoCuentasActivo.nombre}</h4>
                      <span>{productoCuentasActivo.categoria || "Sin categoría"} · Stock tienda {productoCuentasActivo.stock}</span>
                    </div>

                    <div className={styles.accountDetailStats}>
                      <div>
                        <strong>{resumenCuentasActivo?.total || 0}</strong>
                        <span>Total</span>
                      </div>
                      <div>
                        <strong>{resumenCuentasActivo?.disponibles || 0}</strong>
                        <span>Libres</span>
                      </div>
                      <div>
                        <strong>{resumenCuentasActivo?.entregadas || 0}</strong>
                        <span>Ocupadas</span>
                      </div>
                      <div>
                        <strong>{resumenCuentasActivo?.bloqueadas || 0}</strong>
                        <span>Bloqueadas</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.filtersGridCompact}>
                    <input
                      type="search"
                      placeholder={`Buscar cuenta, cliente o nota en ${productoCuentasActivo.nombre}...`}
                      value={busquedaCuenta}
                      onChange={(e) => setBusquedaCuenta(e.target.value)}
                      className={styles.input}
                    />

                    <select
                      value={filtroEstadoCuenta}
                      onChange={(e) => setFiltroEstadoCuenta(e.target.value)}
                      className={styles.input}
                    >
                      <option value="todos">Todos</option>
                      <option value="disponible">Disponibles</option>
                      <option value="entregada">Entregadas / ocupadas</option>
                      <option value="bloqueada">Bloqueadas</option>
                      <option value="vencida">Vencidas</option>
                    </select>
                  </div>

                  {cuentasDetalleProducto.length === 0 ? (
                    <EmptyState title="Sin cuentas en este filtro" text="Cambia el filtro o importa cuentas para esta plataforma." />
                  ) : (
                    <div className={styles.tableWrap}>
                      <table className={styles.proTable}>
                        <thead>
                          <tr>
                            <th>Acceso</th>
                            <th>Cliente asignado</th>
                            <th>Vigencia admin</th>
                            <th>Vigencia cliente</th>
                            <th>Estado</th>
                            <th>Notas</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cuentasDetalleProducto.map((cuenta: any) => {
                            const usuarioCuenta = cuenta.usuario_id ? obtenerUsuarioPorId(cuenta.usuario_id) : null
                            const diasAdmin = diasRestantes(cuenta.fecha_fin)
                            const adminVencida = diasAdmin !== null && diasAdmin < 0
                            const adminPorVencer = diasAdmin !== null && diasAdmin >= 0 && diasAdmin <= 7
                            const diasCliente = diasRestantes(cuenta.cliente_fin)
                            const clienteVencido = diasCliente !== null && diasCliente < 0
                            const clientePorVencer = diasCliente !== null && diasCliente >= 0 && diasCliente <= 7
                            const estadoNormalizado = normalizarTexto(cuenta.estado)
                            const estaEntregada = estadoNormalizado === "entregada"
                            const estaBloqueada = estadoNormalizado === "bloqueada"

                            return (
                              <tr key={cuenta.id}>
                                <td>
                                  <strong>{cuenta.correo}</strong>
                                  <small>Clave: {cuenta.clave}</small>
                                </td>
                                <td>
                                  <strong>{usuarioCuenta?.nombre || (cuenta.usuario_id ? "Cliente asignado" : "Sin cliente")}</strong>
                                  <small>{usuarioCuenta?.correo || (cuenta.usuario_id ? cuenta.usuario_id.slice(0, 8) : "Todavía no entregada")}</small>
                                  {cuenta.pedido_id && <small>Pedido #{cuenta.pedido_id.slice(0, 8)}</small>}
                                </td>
                                <td>
                                  <strong>{fechaCorta(cuenta.fecha_inicio)} → {fechaCorta(cuenta.fecha_fin)}</strong>
                                  <small className={adminVencida ? styles.textDanger : adminPorVencer ? styles.textWarning : styles.textSuccess}>
                                    {diasAdmin === null
                                      ? "Sin cálculo"
                                      : adminVencida
                                      ? `Venció hace ${Math.abs(diasAdmin)} día(s)`
                                      : diasAdmin === 0
                                      ? "Vence hoy"
                                      : `Vence en ${diasAdmin} día(s)`}
                                  </small>
                                </td>
                                <td>
                                  <strong>{cuenta.cliente_inicio && cuenta.cliente_fin ? `${fechaCorta(cuenta.cliente_inicio)} → ${fechaCorta(cuenta.cliente_fin)}` : "Sin entrega"}</strong>
                                  <small className={clienteVencido ? styles.textDanger : clientePorVencer ? styles.textWarning : styles.textSuccess}>
                                    {!cuenta.cliente_fin
                                      ? "Se llenará al aprobar pedido"
                                      : diasCliente === null
                                      ? "Sin cálculo"
                                      : clienteVencido
                                      ? `Cliente venció hace ${Math.abs(diasCliente)} día(s)`
                                      : diasCliente === 0
                                      ? "Cliente vence hoy"
                                      : `Cliente vence en ${diasCliente} día(s)`}
                                  </small>
                                </td>
                                <td>
                                  <span
                                    className={`${styles.statusBadge} ${
                                      estadoNormalizado === "disponible"
                                        ? styles.statusSuccess
                                        : estadoNormalizado === "entregada"
                                        ? styles.statusWarning
                                        : styles.statusDanger
                                    }`}
                                  >
                                    {cuenta.estado}
                                  </span>
                                </td>
                                <td>{cuenta.notas || <span className={styles.mutedText}>Sin notas</span>}</td>
                                <td>
                                  <div className={styles.tableActions}>
                                    <button type="button" className={styles.secondaryButton} onClick={() => copiarDatosCuenta(cuenta)}>Copiar</button>
                                    {estaEntregada && <button type="button" className={styles.successButton} onClick={() => renovarCuentaCliente(cuenta)}>Renovar +30</button>}
                                    {estaEntregada && <button type="button" className={styles.dangerGhostButton} onClick={() => quitarAccesoCuenta(cuenta)}>Quitar acceso</button>}
                                    {estaBloqueada ? (
                                      <button type="button" className={styles.successButton} onClick={() => cambiarEstadoCuentaOperativa(cuenta, "disponible")}>Liberar</button>
                                    ) : (
                                      <button type="button" className={styles.dangerGhostButton} onClick={() => cambiarEstadoCuentaOperativa(cuenta, "bloqueada")}>Bloquear</button>
                                    )}
                                    <button type="button" className={styles.successButton} onClick={() => editarCuenta(cuenta)}>Editar</button>
                                    <button type="button" className={styles.dangerGhostButton} onClick={() => eliminarCuenta(cuenta)}>Eliminar</button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </article>
          </div>
  )
}
