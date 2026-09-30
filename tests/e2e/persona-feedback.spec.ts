import { test, expect } from "@playwright/test";

for (const scenario of [
  "A Acceso no reconocido",
  "B Sospecha sin confirmar",
  "C Un archivo consultado",
]) {
  test(`draft and review keep identical version and text: ${scenario}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByLabel("Estoy usando un dispositivo de confianza").check();
    await page.getByRole("radio", { name: scenario, exact: true }).check();
    await page.getByRole("button", { name: "Preparar borrador" }).click();
    await expect(
      page.getByRole("heading", { name: "Aviso preliminar" }),
    ).toBeVisible();
    const version = page.locator(".panel-title").getByText(/Caso ficticio/);
    const originalVersion = await version.textContent();
    const sentences = page.locator(".sentence > p");
    const originalText = await sentences.allTextContents();
    await page.getByRole("button", { name: "Ir a revisión" }).click();
    await expect(version).toHaveText(originalVersion!);
    await expect(sentences).toHaveText(originalText);
    for (const checkbox of await page.getByLabel("Comparé esta frase").all())
      await checkbox.check();
    await page.getByLabel("Revisé el borrador y sus evidencias").check();
    await page
      .getByRole("navigation")
      .getByRole("button", { name: /Borrador/ })
      .click();
    await expect(version).toHaveText(originalVersion!);
    await expect(sentences).toHaveText(originalText);
    await page.getByRole("button", { name: "Ir a revisión" }).click();
    await expect(version).toHaveText(originalVersion!);
    await expect(sentences).toHaveText(originalText);
    await expect(
      page.getByLabel("Revisé el borrador y sus evidencias"),
    ).toBeChecked();
  });
}

test("simulated persona clarifications and another version require review again", async ({
  page,
}) => {
  await page.goto("/");
  const context = page.locator(".example-context");
  await expect(context).toContainText(
    "Estas selecciones pertenecen al ejemplo ficticio; tú no has confirmado un incidente real",
  );
  await expect(context).toContainText(
    "“Investigación iniciada” es un dato del ejemplo, no una conclusión automática de la app.",
  );
  const contextBox = await context.boundingBox();
  const evidenceBox = await page.locator(".evidence-list").boundingBox();
  expect(contextBox!.y + contextBox!.height).toBeLessThan(evidenceBox!.y);
  await expect(
    page.locator(".evidence-card").first().getByRole("heading"),
  ).toHaveText("Registro de acceso");
  await expect(
    page.locator(".evidence-card").first().locator(".record-id"),
  ).toContainText("A_LOGIN");
  await page.getByLabel("Estoy usando un dispositivo de confianza").check();
  await page.getByRole("button", { name: "Preparar borrador" }).click();
  const status = page.locator(".reference-status");
  await expect(status).toContainText("Cada frase tiene una referencia");
  await expect(status).toContainText(
    "La app no comprueba que el incidente ocurrió",
  );
  await expect(status).not.toContainText("✓");
  await expect(
    page.getByText("Referencias completas", { exact: false }),
  ).toHaveCount(0);
  const anotherVersion = page.getByRole("button", {
    name: "Preparar otra versión",
    exact: true,
  });
  await expect(anotherVersion).toHaveAccessibleDescription(
    "El texto puede quedar igual. Tendrás que revisarlo nuevamente",
  );
  const version = page.locator(".panel-title").getByText(/Caso ficticio/);
  const originalVersion = await version.textContent();
  const sentences = page.locator(".sentence > p");
  const originalText = await sentences.allTextContents();
  await page.getByRole("button", { name: "Ir a revisión" }).click();
  await expect(page.locator(".review-box")).toContainText(
    "En esta demo representarás a la dueña para probar la revisión. En un caso real, entrega el borrador a la persona responsable",
  );
  await expect(page.locator(".review-box")).toContainText(
    "no es una aprobación independiente ni autenticada",
  );
  const finalCheck = page.getByLabel("Revisé el borrador y sus evidencias");
  await expect(finalCheck).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Descargar TXT" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Imprimir", exact: true }),
  ).toBeDisabled();
  for (const checkbox of await page.getByLabel("Comparé esta frase").all())
    await checkbox.check();
  await expect(
    page.getByRole("button", { name: "Descargar TXT" }),
  ).toBeDisabled();
  await finalCheck.check();
  await expect(
    page.getByRole("button", { name: "Descargar TXT" }),
  ).toBeEnabled();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /Borrador/ })
    .click();
  await anotherVersion.click();
  await expect(anotherVersion).toBeEnabled();
  await expect(sentences).toHaveText(originalText);
  await expect(version).not.toHaveText(originalVersion!);
  const newVersion = await version.textContent();
  await page.getByRole("button", { name: "Ir a revisión" }).click();
  await expect(version).toHaveText(newVersion!);
  await expect(sentences).toHaveText(originalText);
  await expect(finalCheck).not.toBeChecked();
  await expect(finalCheck).toBeDisabled();
  for (const checkbox of await page.getByLabel("Comparé esta frase").all())
    await expect(checkbox).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Descargar TXT" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Imprimir", exact: true }),
  ).toBeDisabled();
});
