import { z } from "zod";
import fixtures from "./cases.json";
export const statusLabels = {
  confirmed: "Confirmado por el usuario",
  reported: "Reportado, sin verificar",
  unknown: "Sin confirmar",
};
export const evidenceIds = [
  "A_LOGIN",
  "A_INVESTIGATION",
  "A_IMPACT",
  "B_REPORT",
  "B_IMPACT",
  "C_FILE",
  "C_THEFT",
  "D_REPORT",
] as const;
export const evidenceSchema = z.strictObject({
  id: z.enum(evidenceIds),
  event: z.enum([
    "login",
    "investigation",
    "impact",
    "file",
    "exfiltration",
    "impersonation",
  ]),
  source: z.enum(["registro", "proveedor", "reporte", "ninguna"]),
  status: z.enum(["confirmed", "reported", "unknown"]),
});
export const caseSchema = z.strictObject({
  id: z.enum(["A", "B", "C", "D"]),
  fictional: z.literal(true),
  title: z.string(),
  summary: z.string(),
  evidence: z.array(evidenceSchema),
});
export const cases = z.array(caseSchema).parse(fixtures);
export const inputSchema = z
  .strictObject({
    scenarioId: z.enum(["A", "B", "C"]),
    withheld: z.array(z.enum(evidenceIds)).max(3),
    wording: z.enum(["direct", "formal"]),
  })
  .superRefine((v, ctx) => {
    const c = cases.find((c) => c.id === v.scenarioId)!;
    if (
      new Set(v.withheld).size !== v.withheld.length ||
      v.withheld.some(
        (id) => !c.evidence.some((e) => e.id === id && e.status !== "unknown"),
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "La evidencia no corresponde al caso.",
      });
  });
export type Input = z.infer<typeof inputSchema>;
type Rule = {
  text: string;
  event: z.infer<typeof evidenceSchema>["event"];
  status: keyof typeof statusLabels;
  certainty: "confirmed" | "reported" | "unknown";
};
export const catalog = {
  LOGIN: {
    text: "Detectamos un acceso no reconocido.",
    event: "login",
    status: "confirmed",
    certainty: "confirmed",
  },
  LOGIN_FORMAL: {
    text: "Se registró un acceso no reconocido.",
    event: "login",
    status: "confirmed",
    certainty: "confirmed",
  },
  SUSPECTED: {
    text: "Se reportó un posible acceso no reconocido, aún sin verificar.",
    event: "login",
    status: "reported",
    certainty: "reported",
  },
  LOGIN_UNKNOWN: {
    text: "Aún no hemos confirmado si ocurrió un acceso no reconocido.",
    event: "login",
    status: "unknown",
    certainty: "unknown",
  },
  INVESTIGATION: {
    text: "Estamos investigando si afectó archivos de clientes.",
    event: "investigation",
    status: "confirmed",
    certainty: "confirmed",
  },
  IMPACT_UNKNOWN: {
    text: "Aún no hemos confirmado qué información pudo verse afectada.",
    event: "impact",
    status: "unknown",
    certainty: "unknown",
  },
  FILE: {
    text: "El registro indica que se accedió a un archivo ficticio.",
    event: "file",
    status: "confirmed",
    certainty: "confirmed",
  },
  FILE_FORMAL: {
    text: "Se registró el acceso a un archivo ficticio.",
    event: "file",
    status: "confirmed",
    certainty: "confirmed",
  },
  FILE_UNKNOWN: {
    text: "Aún no hemos confirmado el acceso al archivo ficticio.",
    event: "file",
    status: "unknown",
    certainty: "unknown",
  },
  THEFT_UNKNOWN: {
    text: "No hemos confirmado que se haya extraído información.",
    event: "exfiltration",
    status: "unknown",
    certainty: "unknown",
  },
} satisfies Record<string, Rule>;
export const sentenceIds = Object.keys(catalog) as [
  keyof typeof catalog,
  ...(keyof typeof catalog)[],
];
export const draftSchema = z.strictObject({
  sentences: z
    .array(
      z.strictObject({
        id: z.enum(sentenceIds),
        evidenceIds: z.array(z.enum(evidenceIds)).length(1),
      }),
    )
    .min(2)
    .max(3),
});
export type Draft = z.infer<typeof draftSchema>;
export function evidenceFor(raw: Input) {
  const input = inputSchema.parse(raw);
  return cases
    .find((c) => c.id === input.scenarioId)!
    .evidence.map((e) => ({
      ...e,
      status: input.withheld.includes(e.id) ? ("unknown" as const) : e.status,
    }));
}
export function selectDraft(raw: Input): Draft {
  const input = inputSchema.parse(raw);
  const evidence = evidenceFor(input);
  return {
    sentences: evidence.flatMap((e) => {
      let id: keyof typeof catalog | undefined;
      if (e.event === "login")
        id =
          e.status === "confirmed"
            ? input.wording === "formal"
              ? "LOGIN_FORMAL"
              : "LOGIN"
            : e.status === "reported"
              ? "SUSPECTED"
              : "LOGIN_UNKNOWN";
      if (e.event === "investigation" && e.status === "confirmed")
        id = "INVESTIGATION";
      if (e.event === "impact") id = "IMPACT_UNKNOWN";
      if (e.event === "file")
        id =
          e.status === "confirmed"
            ? input.wording === "formal"
              ? "FILE_FORMAL"
              : "FILE"
            : "FILE_UNKNOWN";
      if (e.event === "exfiltration") id = "THEFT_UNKNOWN";
      return id ? [{ id, evidenceIds: [e.id] }] : [];
    }),
  };
}
export function checkDraft(rawInput: Input, raw: unknown): Draft {
  const input = inputSchema.parse(rawInput);
  const draft = draftSchema.parse(raw);
  const evidence = evidenceFor(input);
  const expected = selectDraft(input);
  if (new Set(draft.sentences.map((s) => s.id)).size !== draft.sentences.length)
    throw new Error("Hay frases duplicadas.");
  for (const sentence of draft.sentences) {
    const rule = catalog[sentence.id];
    const e = evidence.find((e) => e.id === sentence.evidenceIds[0]);
    if (!e || e.event !== rule.event || e.status !== rule.status)
      throw new Error("Frase sin respaldo: revisa la evidencia.");
  }
  if (
    expected.sentences.length !== draft.sentences.length ||
    expected.sentences.some((s) => !draft.sentences.some((d) => d.id === s.id))
  )
    throw new Error(
      "Falta una frase obligatoria o no corresponde a la opción elegida.",
    );
  return draft;
}
