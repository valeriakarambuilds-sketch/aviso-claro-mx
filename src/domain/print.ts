import DOMPurify from "dompurify";
import { exportText, type State } from "./workflow";
export function sanitizedPrintHtml(text: string) {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return DOMPurify.sanitize(
    `<h1>DEMO - DATOS FICTICIOS</h1><pre>${escaped}</pre>`,
    { ALLOWED_TAGS: ["h1", "pre"], ALLOWED_ATTR: [] },
  );
}
export function printHtml(state: State) {
  return sanitizedPrintHtml(exportText(state));
}
