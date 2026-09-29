# Aviso Claro MX

Demo académica en español para preparar avisos con evidencia ficticia y revisión humana. No recibe incidentes reales, no envía mensajes y no guarda casos.

## Ejecutar localmente

Requiere Node.js 22.12 o superior.

```sh
npm ci
npm run build
npm run start
```

Abrir http://127.0.0.1:3000 . Para desarrollar: `npm run dev`.

## Comprobar

```sh
npm test
npm run typecheck
npx playwright install chromium
npm run build
npm run test:e2e
npm audit
```

Playwright comprueba escritorio y un viewport móvil con Chromium; no equivale a una prueba en un iPhone físico. Puede usarse un Chrome local con `PLAYWRIGHT_CHROMIUM_EXECUTABLE` apuntando al ejecutable.

## Modelo y límites

- Casos A/B/C en `src/domain/cases.json`; D orienta al flujo del equipo para apoyo a víctimas, todavía sin servicio conectado.
- Catálogo cerrado y comprobador independiente en `src/domain/evidence.ts`.
- Revisar cada frase habilita el reconocimiento final. Las modificaciones y regeneraciones invalidan la aprobación; los handlers vuelven a comprobarla.
- React conserva el estado solo en memoria. TXT e impresión llevan la marca DEMO. Los archivos descargados sí permanecen en el dispositivo.
- DOMPurify actúa en la frontera de impresión. CSP con nonce y cabeceras de protección; sin analítica ni recursos externos.
- `Referencias completas` describe una comprobación estructural, no la autenticidad de una fuente.

## Gemini opcional

Funciona sin clave mediante `IA SIMULADA - PLANTILLA DEMO`. Para habilitar llamadas reales, copiar `.env.example` a `.env.local`, configurar en privado `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash-lite` y `GEMINI_ENABLED=true`, y reiniciar. Nunca usar una clave `NEXT_PUBLIC_*` ni pegarla en un chat.

Antes de habilitarlo, comprobar la elegibilidad gratuita de la cuenta y mantener desactivada la facturación. [Precios oficiales](https://ai.google.dev/gemini-api/docs/pricing) y [modelo](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-lite), consultados el 29/09/2026. Google puede usar contenido del nivel gratuito para mejorar sus productos; solo se envían identificadores y categorías ficticias.

El servidor exige JSON y mismo origen, limita entradas a 1 KiB, respuestas a 16 KiB, salida del modelo a 512 tokens y espera a 8 segundos. No reintenta cuotas agotadas ni registra cuerpos. Rechaza selección sin respaldo y muestra la razón del fallback. Las pruebas del proveedor usan respuestas simuladas: no certifican conectividad con una cuenta real.

## Entrega

Se conserva el commit original `a4de66e`. Consultar `docs/TEST_LOG.md` para resultados reales y `docs/DECISIONS.md` para pendientes. No se ha publicado por instrucción de la usuaria. Las capturas de `docs/screenshots` son de la app local; no son resultados de la prueba de persona.

La prueba de Mariana debe hacerse en un chat nuevo, según el packet. No se ha inventado feedback, una comparación temporal con la plantilla, un PDF de persona ni un transcript. Guardar/exportar la conversación original desde el cliente para BUILDCHAT; un registro de pruebas no sustituye esa conversación.
