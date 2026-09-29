"use client";
import { useEffect, useRef, useState } from "react";
import {
  cases,
  catalog,
  evidenceFor,
  statusLabels,
  selectDraft,
  checkDraft,
  type Input,
} from "../domain/evidence";
import {
  initialState,
  edit,
  generated,
  approve,
  exportText,
  fingerprint,
  type State,
} from "../domain/workflow";
import { printHtml } from "../domain/print";
import { EvidenceReference } from "../components/EvidenceReference";
const events = {
  login: "Acceso no reconocido",
  investigation: "Investigación iniciada",
  impact: "Información afectada",
  file: "Acceso a un archivo ficticio",
  exfiltration: "Extracción de información",
  impersonation: "Reporte de suplantación",
};
const sources = {
  registro: "Registro ficticio",
  proveedor: "Informe ficticio del proveedor",
  reporte: "Reporte ficticio sin verificar",
  ninguna: "Sin fuente confirmatoria",
};
export default function Home() {
  const [state, setState] = useState<State>(initialState);
  const [scenario, setScenario] = useState("A");
  const [step, setStep] = useState(1);
  const [trusted, setTrusted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("IA SIMULADA - PLANTILLA DEMO");
  const [reason, setReason] = useState(
    "Sin generación todavía. La IA real está desactivada por defecto.",
  );
  const [checked, setChecked] = useState<string[]>([]);
  const [print, setPrint] = useState("");
  const requestId = useRef(0);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus();
  }, [step]);
  const c = cases.find((c) => c.id === scenario)!;
  const evidence = scenario === "D" ? c.evidence : evidenceFor(state.input);
  const approved = !!state.draft && state.approval === fingerprint(state);
  function change(input: Input) {
    requestId.current++;
    setBusy(false);
    setState((s) => edit(s, input));
    setChecked([]);
    setPrint("");
    setError("");
    setReason("Opciones cambiadas. Prepara un nuevo borrador.");
    setMode("IA SIMULADA - PLANTILLA DEMO");
  }
  async function generate() {
    const id = ++requestId.current;
    setState((s) => edit(s, s.input));
    setChecked([]);
    setPrint("");
    setBusy(true);
    setError("");
    try {
      let result: { draft: unknown; mode: string; reason: string };
      try {
        const response = await fetch("/api/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state.input),
          signal: AbortSignal.timeout(12000),
        });
        if (!response.ok) throw new Error("El servidor rechazó la solicitud.");
        result = await response.json();
      } catch {
        result = {
          draft: selectDraft(state.input),
          mode: "IA SIMULADA - PLANTILLA DEMO",
          reason:
            "Servidor no disponible. Se usó la plantilla local comprobada.",
        };
      }
      const draft = checkDraft(state.input, result.draft);
      if (id !== requestId.current) return;
      setState((s) => generated(s, draft));
      setMode(
        result.mode === "IA REAL - SOLO CASOS FICTICIOS"
          ? result.mode
          : "IA SIMULADA - PLANTILLA DEMO",
      );
      setReason(result.reason);
      setStep(2);
    } catch {
      if (id === requestId.current)
        setError(
          "Borrador bloqueado: las frases o referencias no cumplen las reglas. Vuelve a prepararlo.",
        );
    } finally {
      if (id === requestId.current) setBusy(false);
    }
  }
  function download() {
    try {
      const text = exportText(state);
      const url = URL.createObjectURL(
        new Blob([text], { type: "text/plain;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `aviso-demo-${scenario}.txt`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function preparePrint() {
    try {
      setPrint(printHtml(state));
      setTimeout(() => window.print(), 100);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <div className="app-shell">
        <div className="demo-banner">
          <span>DEMO - DATOS FICTICIOS</span>
          <span className="academic">
            Proyecto académico · Sin atención de casos
          </span>
        </div>
        <header>
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              a<span>c</span>
            </span>
            <div>
              <p className="eyebrow">COMUNICAR CON RESPONSABILIDAD</p>
              <h1>
                Aviso Claro <span>MX</span>
              </h1>
            </div>
          </div>
          <p className="tagline">Un aviso claro, basado en lo que sabes.</p>
        </header>
        <div className="mode">
          <span className="dot" />
          <strong>{mode}</strong>
          <span>{reason}</span>
        </div>
        <nav aria-label="Pasos del aviso">
          <ol>
            {["Evidencia", "Borrador", "Revisión"].map((name, i) => (
              <li
                key={name}
                className={
                  step === i + 1 ? "active" : step > i + 1 ? "done" : ""
                }
              >
                <button
                  aria-current={step === i + 1 ? "step" : undefined}
                  disabled={busy || (i > 0 && !state.draft)}
                  onClick={() => setStep(i + 1)}
                >
                  <span>{step > i + 1 ? "✓" : i + 1}</span>
                  {name}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <main>
          <div className="heading">
            <p className="eyebrow">
              PASO {step} DE 3 ·{" "}
              {step === 3 ? "PERSONA REVISORA" : "PERSONA PREPARADORA"}
            </p>
            <h2 ref={title} tabIndex={-1}>
              {step === 1
                ? "Primero, lo que sabemos."
                : step === 2
                  ? "Un borrador con respaldo."
                  : "Revisa antes de compartir."}
            </h2>
            <p>
              {step === 1
                ? "Elige un caso ficticio y distingue los hechos de lo que falta por confirmar."
                : step === 2
                  ? "Cada frase tiene una referencia. Lo que no sabemos también se dice."
                  : "Compara cada frase con su evidencia y aprueba esta versión del aviso."}
            </p>
          </div>
          {error && (
            <div role="alert" className="warning">
              {error}
            </div>
          )}
          {step === 1 ? (
            <>
              <section className="trust">
                <div>
                  <strong>Usa un dispositivo de confianza</strong>
                  <p>
                    Al recargar se borra el borrador. Los archivos descargados
                    permanecen: elimínalos si usas un equipo compartido.
                  </p>
                </div>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={trusted}
                    onChange={(e) => setTrusted(e.target.checked)}
                  />
                  Estoy usando un dispositivo de confianza
                </label>
              </section>
              <fieldset className="case-picker">
                <legend>1. Elige un escenario ficticio</legend>
                {cases.map((item) => (
                  <label
                    className={scenario === item.id ? "case selected" : "case"}
                    key={item.id}
                  >
                    <input
                      type="radio"
                      aria-label={`${item.id} ${item.title}`}
                      name="scenario"
                      value={item.id}
                      checked={scenario === item.id}
                      onChange={() => {
                        setScenario(item.id);
                        change({
                          ...initialState.input,
                          scenarioId: item.id === "D" ? "A" : item.id,
                        });
                      }}
                    />
                    <span className="case-letter">{item.id}</span>
                    <span>{item.title}</span>
                  </label>
                ))}
              </fieldset>
            </>
          ) : null}
          {scenario === "D" ? (
            <section className="panel route">
              <span className="pill amber">Orientación a otro flujo</span>
              <h3>Este caso necesita apoyo a víctimas</h3>
              <p>{c.summary}</p>
              <p>
                El siguiente paso en el proyecto del equipo es el servicio de
                apoyo a víctimas por suplantación. Esta demo no recibe reportes
                ni tiene un servicio de atención conectado.
              </p>
              <strong>
                No hay evidencia para redactar un aviso de brecha empresarial.
              </strong>
              <button
                className="secondary"
                onClick={() => {
                  setScenario("A");
                  change(initialState.input);
                }}
              >
                Volver a los casos de aviso
              </button>
            </section>
          ) : (
            <div className="workspace">
              <aside className="panel evidence">
                <div className="panel-title">
                  <span className="icon">▤</span>
                  <h3>
                    {step === 1
                      ? "2. Inspecciona la evidencia"
                      : "Evidencias del aviso"}
                  </h3>
                </div>
                <p>{c.summary}</p>
                <p className="small">
                  “Confirmado” significa que el usuario indica tener una fuente.
                  La app no la autentica.
                </p>
                <div className="evidence-list">
                  {evidence.map((e) => (
                    <article
                      key={e.id}
                      id={`evidence-${e.id}`}
                      className="evidence-card"
                    >
                      <div className="record-id">{e.id}</div>
                      <h4>{events[e.event]}</h4>
                      <span
                        className={`pill ${e.status === "confirmed" ? "teal" : "amber"}`}
                      >
                        {statusLabels[e.status]}
                      </span>
                      <p className="small">
                        {sources[e.source]}
                        {state.input.withheld.includes(e.id)
                          ? " · Respaldo retirado en esta versión."
                          : ""}
                      </p>
                      {step === 1 &&
                        c.evidence.find((original) => original.id === e.id)
                          ?.status !== "unknown" && (
                          <label className="check small">
                            <input
                              type="checkbox"
                              checked={!state.input.withheld.includes(e.id)}
                              onChange={(event) =>
                                change({
                                  ...state.input,
                                  withheld: event.target.checked
                                    ? state.input.withheld.filter(
                                        (id) => id !== e.id,
                                      )
                                    : [...state.input.withheld, e.id],
                                })
                              }
                            />
                            Incluir respaldo ficticio
                          </label>
                        )}
                    </article>
                  ))}
                </div>
                <div className="note">
                  No subas documentos ni datos de clientes. Solo trabajamos con
                  estos ejemplos.
                </div>
              </aside>
              <section className="panel draft-panel">
                {step === 1 ? (
                  <>
                    <div className="panel-title">
                      <span className="icon">↗</span>
                      <h3>De la evidencia al aviso</h3>
                    </div>
                    <p>
                      El aviso incluirá únicamente frases permitidas por el
                      respaldo seleccionado.
                    </p>
                    <ul className="principles">
                      <li>Los hechos sin respaldo siguen sin confirmar.</li>
                      <li>Una sospecha no se convierte en un hecho.</li>
                      <li>Tú revisas el aviso antes de exportarlo.</li>
                    </ul>
                    <div className="uncertainty">
                      <strong>Lo que todavía no sabemos</strong>
                      <p>
                        {scenario === "C"
                          ? "No se ha confirmado extracción de información."
                          : "No se ha confirmado qué información pudo verse afectada."}
                      </p>
                    </div>
                    <label className="select-label">
                      Estilo del aviso
                      <select
                        value={state.input.wording}
                        onChange={(e) =>
                          change({
                            ...state.input,
                            wording: e.target.value as Input["wording"],
                          })
                        }
                      >
                        <option value="direct">Directo</option>
                        <option value="formal">Formal</option>
                      </select>
                    </label>
                    <div className="actions">
                      <button
                        className="primary"
                        disabled={!trusted || busy}
                        onClick={generate}
                      >
                        {busy ? "Preparando…" : "Preparar borrador →"}
                      </button>
                    </div>
                    {!trusted && (
                      <p className="small">
                        Confirma el uso de un dispositivo de confianza para
                        continuar.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="panel-title">
                      <span className="icon">▤</span>
                      <div>
                        <h3>
                          {step === 2
                            ? "Aviso preliminar"
                            : "Borrador para revisión"}
                        </h3>
                        <span className="small">
                          Caso ficticio {scenario} · Versión {state.version}
                        </span>
                      </div>
                    </div>
                    <div className="notice">
                      {state.draft?.sentences.map((s) => (
                        <div
                          className="sentence"
                          key={`${state.version}-${s.id}`}
                        >
                          <p>{catalog[s.id].text}</p>
                          {evidence
                            .filter((e) => e.id === s.evidenceIds[0])
                            .map((e) => (
                              <EvidenceReference
                                key={e.id}
                                evidence={e}
                                title={events[e.event]}
                                source={sources[e.source]}
                                withheld={state.input.withheld.includes(e.id)}
                              />
                            ))}
                          {step === 3 && (
                            <label className="check small">
                              <input
                                type="checkbox"
                                checked={checked.includes(s.id)}
                                onChange={(e) => {
                                  setChecked(
                                    e.target.checked
                                      ? [...checked, s.id]
                                      : checked.filter((id) => id !== s.id),
                                  );
                                  setState((s) => ({ ...s, approval: null }));
                                  setPrint("");
                                }}
                              />
                              Comparé esta frase con su referencia
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="reference-status">
                      <strong>✓ Referencias completas</strong>
                      <p>
                        La estructura cumple las reglas. Esto no verifica de
                        forma independiente que el incidente ocurrió.
                      </p>
                    </div>
                    {step === 2 ? (
                      <>
                        <label className="select-label">
                          Estilo del aviso
                          <select
                            value={state.input.wording}
                            onChange={(e) => {
                              change({
                                ...state.input,
                                wording: e.target.value as Input["wording"],
                              });
                              setStep(1);
                            }}
                          >
                            <option value="direct">Directo</option>
                            <option value="formal">Formal</option>
                          </select>
                        </label>
                        <div className="actions">
                          <button
                            className="secondary"
                            disabled={busy}
                            onClick={generate}
                          >
                            Regenerar
                          </button>
                          <button
                            className="primary"
                            disabled={busy}
                            onClick={() => setStep(3)}
                          >
                            Ir a revisión →
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="review-box">
                          <strong>Ahora actúas como persona revisora</strong>
                          <p>
                            En un caso real, la persona responsable debe
                            contrastar las fuentes fuera de la app. Aquí una
                            misma persona representa ambos roles.
                          </p>
                          <label className="check">
                            <input
                              type="checkbox"
                              checked={approved}
                              disabled={
                                checked.length !== state.draft?.sentences.length
                              }
                              onChange={(e) => {
                                setState((s) =>
                                  e.target.checked
                                    ? approve(s)
                                    : { ...s, approval: null },
                                );
                                setPrint("");
                              }}
                            />
                            Revisé el borrador y sus evidencias; apruebo esta
                            versión demo
                          </label>
                          <p className="small">
                            Es un reconocimiento de demostración, no una
                            autorización autenticada. Cualquier cambio exige una
                            nueva revisión.
                          </p>
                        </div>
                        <div className="actions">
                          <button
                            className="secondary"
                            disabled={!approved}
                            onClick={preparePrint}
                          >
                            Imprimir
                          </button>
                          <button
                            className="primary"
                            disabled={!approved}
                            onClick={download}
                          >
                            Descargar TXT ↓
                          </button>
                        </div>
                        <p className="export-caption">
                          {approved
                            ? "Versión demo revisada."
                            : "Exportación bloqueada hasta completar la revisión."}{" "}
                          Nada se envía automáticamente.
                        </p>
                      </>
                    )}
                    <button className="text-button" onClick={() => setStep(1)}>
                      ← Volver a evidencia
                    </button>
                  </>
                )}
              </section>
            </div>
          )}
        </main>
        <footer>
          <span>
            Aviso Claro MX <b>·</b> Demo académica
          </span>
          <p>
            Ayuda a preparar un aviso; no determina obligaciones, plazos ni
            suficiencia legal. Sin cuentas ni almacenamiento de casos. El
            proveedor y el alojamiento pueden conservar metadatos operativos.
          </p>
        </footer>
      </div>
      <section
        className="print-only"
        aria-label="Aviso imprimible"
        dangerouslySetInnerHTML={{ __html: print }}
      />
    </>
  );
}
