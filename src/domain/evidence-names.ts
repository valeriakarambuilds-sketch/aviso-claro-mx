import type { evidenceIds } from "./evidence";

// Human-readable labels; identifiers remain available for tracing each fixture.
export const evidenceNames: Record<(typeof evidenceIds)[number], string> = {
  A_LOGIN: "Registro de acceso",
  A_INVESTIGATION: "Informe de investigación",
  A_IMPACT: "Impacto en archivos",
  B_REPORT: "Reporte de posible acceso",
  B_IMPACT: "Impacto en la información",
  C_FILE: "Registro de consulta de archivo",
  C_THEFT: "Extracción sin confirmar",
  D_REPORT: "Reporte de suplantación",
};
