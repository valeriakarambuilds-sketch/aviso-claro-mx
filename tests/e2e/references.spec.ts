import { test, expect } from "@playwright/test";

const scenarios = [
  {
    name: "A Acceso no reconocido",
    references: [
      {
        id: "A_LOGIN",
        name: "Registro de acceso",
        title: "Acceso no reconocido",
        source: "Registro ficticio",
        status: "Confirmado por el usuario",
        explanation:
          "No demuestra que se hayan consultado archivos de clientes.",
      },
      {
        id: "A_INVESTIGATION",
        name: "Informe de investigación",
        title: "Investigación iniciada",
        source: "Informe ficticio del proveedor",
        status: "Confirmado por el usuario",
        explanation:
          "Permite decir que se está investigando, pero no confirmar el impacto en archivos.",
      },
      {
        id: "A_IMPACT",
        name: "Impacto en archivos",
        title: "Información afectada",
        source: "Sin fuente confirmatoria",
        status: "Sin confirmar",
        explanation:
          "No hay evidencia que determine qué información pudo verse afectada.",
      },
    ],
  },
  {
    name: "B Sospecha sin confirmar",
    references: [
      {
        id: "B_REPORT",
        name: "Reporte de posible acceso",
        title: "Acceso no reconocido",
        source: "Reporte ficticio sin verificar",
        status: "Reportado, sin verificar",
        explanation:
          "El reporte permite expresar una sospecha, no afirmar que el acceso ocurrió.",
      },
      {
        id: "B_IMPACT",
        name: "Impacto en la información",
        title: "Información afectada",
        source: "Sin fuente confirmatoria",
        status: "Sin confirmar",
        explanation:
          "No hay evidencia que determine qué información pudo verse afectada.",
      },
    ],
  },
  {
    name: "C Un archivo consultado",
    references: [
      {
        id: "C_FILE",
        name: "Registro de consulta de archivo",
        title: "Acceso a un archivo ficticio",
        source: "Registro ficticio",
        status: "Confirmado por el usuario",
        explanation:
          "El acceso al archivo no demuestra extracción de información.",
      },
      {
        id: "C_THEFT",
        name: "Extracción sin confirmar",
        title: "Extracción de información",
        source: "Sin fuente confirmatoria",
        status: "Sin confirmar",
        explanation:
          "No hay evidencia que confirme la extracción de información.",
      },
    ],
  },
];
for (const scenario of scenarios) {
  test(`references show correct evidence without clearing review: ${scenario.name}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByLabel("Estoy usando un dispositivo de confianza").check();
    await page.getByRole("radio", { name: scenario.name, exact: true }).check();
    await page.getByRole("button", { name: "Preparar borrador" }).click();
    await page.getByRole("button", { name: "Ir a revisión" }).click();
    const checks = page.getByLabel("Comparé esta frase");
    await checks.first().check();
    const url = page.url();
    const version = await page
      .locator(".panel-title")
      .getByText(/Caso ficticio/)
      .textContent();
    for (const ref of scenario.references) {
      const trigger = page
        .locator(".sentence")
        .getByRole("button", { name: new RegExp(`^${ref.name} ·`) });
      await trigger.click();
      const panel = page.getByRole("region", {
        name: `Evidencia ficticia: ${ref.name}`,
        exact: true,
      });
      await expect(panel).toBeVisible();
      await expect(panel.getByRole("heading")).toBeInViewport();
      await expect(panel).toContainText(ref.title);
      await expect(panel.getByRole("heading")).toHaveText(ref.name);
      await expect(panel.locator(".record-id")).toContainText(ref.id);
      await expect(panel).toContainText(ref.source);
      await expect(panel).toContainText(ref.status);
      await expect(panel).toContainText(ref.explanation);
      await expect(panel).toContainText("DEMO - DATOS FICTICIOS");
      await panel.getByRole("button", { name: "Cerrar referencia" }).click();
      await expect(panel).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
    await expect(checks.first()).toBeChecked();
    await expect(
      page.getByRole("heading", { name: "Revisa antes de compartir." }),
    ).toBeVisible();
    expect(page.url()).toBe(url);
    await expect(
      page.locator(".panel-title").getByText(/Caso ficticio/),
    ).toHaveText(version!);
    for (const checkbox of await checks.all()) await checkbox.check();
    const approval = page.getByLabel("Revisé el borrador y sus evidencias");
    await approval.check();
    for (const ref of scenario.references) {
      const trigger = page
        .locator(".sentence")
        .getByRole("button", { name: new RegExp(`^${ref.name} ·`) });
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("region", {
          name: `Evidencia ficticia: ${ref.name}`,
          exact: true,
        }),
      ).toBeVisible();
      await expect(approval).toBeChecked();
      await expect(
        page.getByRole("button", { name: "Descargar TXT" }),
      ).toBeEnabled();
    }
  });
}

test("withdrawn evidence shows current unknown status and keeps the new review", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Estoy usando un dispositivo de confianza").check();
  await page.getByLabel("Incluir respaldo ficticio").first().uncheck();
  await page.getByRole("button", { name: "Preparar borrador" }).click();
  await page.getByRole("button", { name: "Ir a revisión" }).click();
  await page.getByLabel("Comparé esta frase").first().check();
  await page
    .getByRole("button", { name: "Registro de acceso · Estado sin confirmar" })
    .click();
  const panel = page.getByRole("region", {
    name: "Evidencia ficticia: Registro de acceso",
    exact: true,
  });
  await expect(panel).toBeVisible();
  await expect(panel.locator(".pill")).toHaveText("Sin confirmar");
  await expect(panel).toContainText("Respaldo retirado en esta versión.");
  await expect(panel).toContainText(
    "Esta fuente no se está usando para sostener la frase",
  );
  await expect(page.getByLabel("Comparé esta frase").first()).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Descargar TXT" }),
  ).toBeDisabled();
});
