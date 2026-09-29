# Decisions - Aviso Claro MX

## 29 September 2026 - packet session

- Valeria's slice: evidence-gated business notices; team primary vacuum remains victim response.
- Three Spanish steps; fictional structured cases only; no raw incident text or uploads.
- LLM chooses approved sentence IDs; independent rules check references and certainty.
- DOMPurify protects print HTML; Zod validates structure; neither verifies the incident.
- No personal-data storage, database, authenticated role claim, or auto-send in the demo.
- Approval must reset after any edit or regeneration.
- Real Gemini free-tier adapter is optional; fallback visibly labeled as simulated template selection.
- Packet and AI-generated mockup prepared before code. No implementation, test, commit, push or deploy is claimed in this session.

## Next session's first move

Commit these documents before implementation, then give docs/IMPLEMENTATION_PROMPT.md to the terminal coding agent. Start with fictional evidence schema and support-checker tests.

## Open questions for validation

- Does the persona distinguish a user-confirmed source from independently verified evidence?
- Is drafting plus review faster or clearer than a static template?
- Who would pay per incident, and does that cover human review time?
- Before real use: designated reviewer identity, legal applicability, privacy model and authenticated roles need validation.

## 29 de septiembre de 2026 — implementación local

- El commit del packet `a4de66e` se conserva sin reescribir historia. Etapas: `f5e4d8d` (reglas), `afeabcf` (pantallas), `1f897e8` (adaptador), `900606a` (correcciones observadas y regresiones).
- Implementados A/B/C y orientación D. Las fuentes ficticias originales se pueden retirar, pero nunca elevar una sospecha a confirmación. El catálogo limita las variantes y conserva la incertidumbre obligatoria.
- Tres pantallas en español; revisión por frase y reconocimiento final de la versión vigente. La app no autentica a un revisor independiente. Exportación TXT e impresión locales, ambas marcadas DEMO.
- Estado solo en memoria, sin formulario de texto libre, identidad, archivos, cuenta, base de datos ni envíos. No se añadió servicio de apoyo a víctimas: D explica la derivación pendiente sin inventar un enlace del equipo.
- Gemini opcional solo servidor, desactivado. Modelo permitido gemini-2.5-flash-lite, consultado en documentación oficial; elegibilidad de cuenta pendiente. No se configuró clave, facturación o llamada real. El modo simulado explica su razón.
- Next.js 16.3.7 y Vitest 5.0.2 resolvieron los avisos de auditoría iniciales. CSP con nonce requiere renderizado dinámico. La validación de origen usa el Host real de destino y conserva el protocolo; no confía en X-Forwarded-Host.
- Resultados: 33/33 pruebas unitarias/integración, 6/6 recorridos de navegador en escritorio/móvil, build de producción y formato correctos. Auditoría npm: cero vulnerabilidades reportadas. TEST_LOG.md describe los dos fallos reales y los retests, sin afirmar verificación independiente de incidentes.
- Capturas locales preparadas. Prueba de persona, medición frente a plantilla y PDFs de entrega siguen pendientes; no se simularon ni se inventó su resultado. La conversación original debe exportarse desde el cliente para BUILDCHAT.
- La usuaria pidió no publicar: no se hizo push ni despliegue. No hay remote configurado. La aplicación se inicia solo en 127.0.0.1:3000.

## Primer movimiento de la siguiente sesión

Abrir la aplicación local y usar las seis capturas en un chat nuevo para la prueba de Mariana descrita en el packet; registrar sus respuestas reales y el principal malentendido antes de cambiar la interfaz. Publicar y realizar las dos comprobaciones de despliegue solo cuando la usuaria lo solicite. No se reclama ninguna URL pública ni ahorro de tiempo.

## 29 de septiembre de 2026 — apertura de referencias

- Las referencias de Borrador/Revisión ahora abren un panel dentro de la misma frase, en lugar de navegar a un ancla de la columna lateral. Muestran evidencia ficticia, fuente, estado vigente y explicación del límite de esa evidencia.
- Consultar o cerrar un respaldo no es una edición: conserva casillas, aprobación y versión. El panel tiene estado local independiente; cambiar evidencia o regenerar continúa borrando la aprobación. Una fuente retirada se identifica explícitamente y se muestra con estado Sin confirmar.
- Se reprodujo el fallo original en las tres referencias de A antes de corregirlo. La regresión cubre cada referencia de A/B/C, teclado, panel visible en escritorio/móvil y respaldo retirado. Resultado: 33 pruebas de lógica/API y 14 de navegador aprobadas, más build y TypeScript correctos. Detalle en TEST_LOG.md.
- Sin publicación ni push. IA real desactivada. Se deja el servidor de producción local en http://127.0.0.1:3000 para que la usuaria repita la prueba.

### Primer movimiento siguiente

Repetir manualmente en Revisión los clics «Ver respaldo ficticio» y «Estado sin confirmar», también después de aprobar el aviso: el panel debe mostrar el detalle y la aprobación debe conservarse. Después continuar con la prueba de Mariana en chat separado. Los despliegues siguen aplazados hasta que la usuaria los solicite.
