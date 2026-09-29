import { useEffect, useId, useRef, useState } from "react";
import { type z } from "zod";
import { evidenceSchema, statusLabels } from "../domain/evidence";

type Evidence = z.infer<typeof evidenceSchema>;
const details: Record<
  Evidence["id"],
  { evidence: string; explanation: string }
> = {
  A_LOGIN: {
    evidence:
      "El registro del escenario ficticio indica un inicio de sesión no reconocido.",
    explanation: "No demuestra que se hayan consultado archivos de clientes.",
  },
  A_INVESTIGATION: {
    evidence:
      "El informe ficticio del proveedor registra el inicio de una investigación.",
    explanation:
      "Permite decir que se está investigando, pero no confirmar el impacto en archivos.",
  },
  A_IMPACT: {
    evidence:
      "El escenario ficticio no incluye una fuente que confirme el impacto en archivos de clientes.",
    explanation:
      "No hay evidencia que determine qué información pudo verse afectada.",
  },
  B_REPORT: {
    evidence:
      "En este escenario ficticio se reportó un posible acceso sin una fuente que lo confirme.",
    explanation:
      "El reporte permite expresar una sospecha, no afirmar que el acceso ocurrió.",
  },
  B_IMPACT: {
    evidence:
      "El escenario ficticio no incluye una fuente que confirme el impacto en la información.",
    explanation:
      "No hay evidencia que determine qué información pudo verse afectada.",
  },
  C_FILE: {
    evidence:
      "El registro del escenario ficticio indica acceso a un archivo sintético.",
    explanation: "El acceso al archivo no demuestra extracción de información.",
  },
  C_THEFT: {
    evidence:
      "El escenario ficticio solo registra acceso a un archivo, sin prueba de extracción.",
    explanation: "No hay evidencia que confirme la extracción de información.",
  },
  D_REPORT: {
    evidence:
      "El escenario ficticio describe un reporte de suplantación para una colecta.",
    explanation:
      "Corresponde al flujo de apoyo a víctimas, no confirma una brecha empresarial.",
  },
};

export function EvidenceReference({
  evidence,
  title,
  source,
  withheld,
}: {
  evidence: Evidence;
  title: string;
  source: string;
  withheld: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (open) {
      panel.current?.focus({ preventScroll: true });
      panel.current?.scrollIntoView({ block: "nearest" });
    }
  }, [open]);
  const detail = details[evidence.id];
  function close() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
    trigger.current?.scrollIntoView({ block: "nearest" });
  }
  return (
    <>
      <button
        type="button"
        className="reference-trigger"
        ref={trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        {evidence.id} ·{" "}
        {evidence.status === "unknown"
          ? "Estado sin confirmar"
          : "Ver respaldo ficticio"}{" "}
        <span aria-hidden="true">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <section
          id={panelId}
          className="reference-panel"
          ref={panel}
          tabIndex={-1}
          aria-label={`Evidencia ficticia ${evidence.id}`}
        >
          <p className="eyebrow">DEMO - DATOS FICTICIOS</p>
          <h4>
            {evidence.id} · {title}
          </h4>
          <span
            className={`pill ${evidence.status === "confirmed" ? "teal" : "amber"}`}
          >
            {statusLabels[evidence.status]}
          </span>
          <dl>
            <dt>{withheld ? "Fuente original del escenario" : "Fuente"}</dt>
            <dd>{source}</dd>
            <dt>Evidencia ficticia del escenario</dt>
            <dd>{detail.evidence}</dd>
            <dt>Qué significa en esta versión</dt>
            <dd>
              {withheld
                ? "Respaldo retirado en esta versión. Esta fuente no se está usando para sostener la frase; el hecho queda sin confirmar."
                : detail.explanation}
            </dd>
          </dl>
          <p className="small">
            La app muestra un ejemplo del catálogo; no consulta ni autentica un
            registro real. “Confirmado por el usuario” no significa verificado
            de forma independiente.
          </p>
          <button type="button" className="text-button" onClick={close}>
            Cerrar referencia
          </button>
        </section>
      )}
    </>
  );
}
