import { catalog, checkDraft, type Draft, type Input } from "./evidence";
export type State = {
  input: Input;
  draft: Draft | null;
  version: number;
  approval: string | null;
};
export const initialState: State = {
  input: { scenarioId: "A", withheld: [], wording: "direct" },
  draft: null,
  version: 1,
  approval: null,
};
export function fingerprint(s: State) {
  return JSON.stringify([s.version, s.input, s.draft]);
}
export function edit(s: State, input: Input): State {
  return { input, draft: null, version: s.version + 1, approval: null };
}
export function generated(s: State, draft: Draft): State {
  return {
    ...s,
    draft: checkDraft(s.input, draft),
    version: s.version + 1,
    approval: null,
  };
}
export function approve(s: State): State {
  if (!s.draft) throw new Error("Primero prepara un borrador.");
  checkDraft(s.input, s.draft);
  return { ...s, approval: fingerprint(s) };
}
export function exportText(s: State) {
  if (!s.draft || s.approval !== fingerprint(s))
    throw new Error("Revisa y aprueba la versión actual antes de exportar.");
  const d = checkDraft(s.input, s.draft);
  return [
    "DEMO - DATOS FICTICIOS",
    "Aviso Claro MX · Aviso preliminar",
    `Caso ficticio ${s.input.scenarioId} · Versión ${s.version}`,
    "",
    ...d.sentences.map(
      (s) => `${catalog[s.id].text} [${s.evidenceIds.join(", ")}]`,
    ),
    "",
    "Referencias completas: no equivale a hechos verificados de forma independiente.",
    "Revisión de demostración: no es una autorización autenticada.",
    "Demo académica, sin atención de casos. No determina obligaciones legales.",
    "Archivo local: no se envía a ninguna persona.",
  ].join("\n");
}
