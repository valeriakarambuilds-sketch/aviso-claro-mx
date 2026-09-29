// @vitest-environment jsdom
import { it, expect } from "vitest";
import { sanitizedPrintHtml, printHtml } from "../src/domain/print";
import { initialState } from "../src/domain/workflow";
it("print boundary does not execute markup", () => {
  const div = document.createElement("div");
  div.innerHTML = sanitizedPrintHtml(
    "<img src=x onerror=alert(1)><script>alert(1)</script>",
  );
  expect(div.querySelector("img,script")).toBeNull();
  expect(div.textContent).toContain("<script>");
});
it("print cannot bypass review", () =>
  expect(() => printHtml(initialState)).toThrow());
