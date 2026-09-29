import { test, expect } from "@playwright/test";
test("full review, local export, invalidation, print and reload", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:3000")) external.push(r.url());
  });
  const response = await page.goto("/");
  expect(response?.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  await expect(
    page.getByRole("button", { name: "Preparar borrador" }),
  ).toBeDisabled();
  await page.getByLabel("Estoy usando un dispositivo de confianza").check();
  await page.screenshot({
    path: `docs/screenshots/${testInfo.project.name}-evidencia.png`,
    fullPage: true,
  });
  const req = page.waitForRequest("**/api/draft");
  const apiResponse = page.waitForResponse("**/api/draft");
  await page.getByRole("button", { name: "Preparar borrador" }).click();
  expect((await apiResponse).status()).toBe(200);
  expect((await req).postDataJSON()).toEqual({
    scenarioId: "A",
    withheld: [],
    wording: "direct",
  });
  await expect(
    page.getByText("IA SIMULADA - PLANTILLA DEMO", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Detectamos un acceso no reconocido.", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/${testInfo.project.name}-borrador.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Ir a revisión" }).click();
  await expect(
    page.getByRole("button", { name: "Descargar TXT" }),
  ).toBeDisabled();
  const approval = page.getByLabel("Revisé el borrador y sus evidencias");
  await expect(approval).toBeDisabled();
  for (const checkbox of await page.getByLabel("Comparé esta frase").all())
    await checkbox.check();
  await approval.focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Descargar TXT" }),
  ).toBeEnabled();
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar TXT" }).click();
  const download = await dl;
  expect(download.suggestedFilename()).toBe("aviso-demo-A.txt");
  const stream = await download.createReadStream();
  let text = "";
  for await (const chunk of stream!) text += chunk.toString();
  expect(text).toContain("DEMO - DATOS FICTICIOS");
  expect(text).toContain("[A_IMPACT]");
  await page.screenshot({
    path: `docs/screenshots/${testInfo.project.name}-revision.png`,
    fullPage: true,
  });
  await page.evaluate(() => {
    window.print = () => {};
  });
  await page.getByRole("button", { name: "Imprimir" }).click();
  await page.emulateMedia({ media: "print" });
  await expect(
    page.getByRole("region", { name: "Aviso imprimible" }),
  ).toContainText("Aún no hemos confirmado");
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "Volver a evidencia" }).click();
  await page.getByLabel("Incluir respaldo ficticio").first().uncheck();
  await page.getByRole("button", { name: "Preparar borrador" }).click();
  await page.getByRole("button", { name: "Ir a revisión" }).click();
  await expect(approval).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Descargar TXT" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
      cookies: document.cookie,
    })),
  ).toEqual({ local: 0, session: 0, cookies: "" });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Primero, lo que sabemos." }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Estoy usando un dispositivo de confianza"),
  ).not.toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
test("cases B C and victim-support route", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Estoy usando un dispositivo de confianza").check();
  await page.getByRole("radio", { name: "B Sospecha sin confirmar" }).check();
  await page.getByRole("button", { name: "Preparar borrador" }).click();
  await expect(
    page.getByText(
      "Se reportó un posible acceso no reconocido, aún sin verificar.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Volver a evidencia" }).click();
  await page.getByRole("radio", { name: "C Un archivo consultado" }).check();
  await page.getByRole("button", { name: "Preparar borrador" }).click();
  await expect(
    page.getByText("No hemos confirmado que se haya extraído información.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Volver a evidencia" }).click();
  await page.getByRole("radio", { name: "D Suplantación y colecta" }).check();
  await expect(
    page.getByRole("heading", { name: "Este caso necesita apoyo a víctimas" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Preparar borrador" }),
  ).toHaveCount(0);
});

test("CSP nonce permits hydration and changes on every request", async ({
  page,
}) => {
  const violations: string[] = [];
  page.on("console", (m) => {
    if (m.text().includes("Content Security Policy")) violations.push(m.text());
  });
  const first = await page.goto("/");
  const csp = first!.headers()["content-security-policy"];
  const nonce = csp.match(/'nonce-([^']+)'/)![1];
  expect(
    await page
      .locator("script")
      .evaluateAll((nodes) =>
        nodes.every((n) => ((n as HTMLScriptElement).nonce ?? "").length > 0),
      ),
  ).toBe(true);
  expect(
    await page
      .locator("script")
      .first()
      .evaluate((n) => (n as HTMLScriptElement).nonce),
  ).toBe(nonce);
  await page.getByLabel("Estoy usando un dispositivo de confianza").check();
  await expect(
    page.getByRole("button", { name: "Preparar borrador" }),
  ).toBeEnabled();
  const second = await page.reload();
  expect(second!.headers()["content-security-policy"]).not.toBe(csp);
  expect(violations).toEqual([]);
});
