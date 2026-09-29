# Registro de pruebas — 29 de septiembre de 2026

Solo pruebas locales con datos ficticios. No se ha publicado ni realizado la prueba de persona en chat separado.

## Etapa 1
- Se conserva `a4de66e`, documentación anterior al código.
- Casos JSON A/B/C y derivación D, esquemas estrictos, catálogo y comprobador independiente.
- La instalación inicial requirió acceso de red fuera del sandbox.
- Auditoría inicial: 4 vulnerabilidades (3 moderadas, 1 alta). Se actualizarán las dependencias antes del cierre.
- Vitest: 12/12 pruebas de evidencia aprobadas (certeza, incertidumbre obligatoria, referencias falsas, campos extra y separación acceso/extracción).

## Etapa 2
- 17/17 pruebas de evidencia, revisión y salida imprimible aprobadas.
- Actualización a Next.js 16.3.7 / Vitest 5.0.2: auditoría de instalación sin vulnerabilidades.
- TypeScript detectó tipos URLPattern incompatibles dentro de declaraciones de Next.js. Se usa skipLibCheck para dependencias; el código de la app conserva strict.
- Tres pantallas, revisión por frase, descarga local, impresión saneada y CSP con nonce. Aún pendiente comprobarlas en navegador.

## Etapa 3
- 32/32 pruebas unitarias e integración aprobadas, incluida API: JSON, origen, tamaño, campos extra, cuota, tiempo de espera, respuesta inválida y rechazo de afirmaciones.
- Compilación de producción correcta con Next.js 16.3.7.
- Gemini desactivado por defecto; no se usó ninguna clave ni se hizo una llamada real al proveedor.
- Modelo permitido `gemini-2.5-flash-lite`, con nivel gratuito estándar según https://ai.google.dev/gemini-api/docs/pricing y soporte estructurado según https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-lite . Consultados el 29/09/2026. La elegibilidad de una cuenta se debe comprobar antes de habilitarlo; esta app no activa facturación.
- No se publica por instrucción explícita de la usuaria.

## Fallo observado y corrección local
- Primera ejecución E2E: el navegador de Playwright aún no estaba descargado. Se usó temporalmente Chrome instalado con un perfil aislado.
- Primera pasada real sobre `1f897e8`: 4/4 flujos fallaron. La CSP bloqueó scripts sin nonce; el checkbox no actualizaba React y el botón de borrador quedaba deshabilitado. La traza confirmó violaciones `script-src ... strict-dynamic`. Causa: página prerenderizada estáticamente, incompatible con nonce por petición.
- Corrección: renderizado dinámico desde layout y regresión que comprueba nonce en scripts, renovación entre peticiones, hidratación y ausencia de violaciones CSP.
- Además, la letra de caso oculta en móvil alteraba el nombre accesible del radio: se añade aria-label consistente.
- Segunda pasada: 6/6 E2E aprobados y 32/32 unitarios; la inspección visual de las capturas detectó un fallback de conexión inesperado. Se amplió la prueba para exigir HTTP 200 de la API y falló con HTTP 403.
- Causa del segundo fallo: Next usa un hostname interno en request.url, diferente al Host al que navega el usuario. La comprobación ahora compara Origin con protocolo y Host de destino, sin confiar en X-Forwarded-Host. Regresión cubre hostname interno, origen atacante, protocolo distinto y origen null.

## Resultado final local
- 33/33 pruebas Vitest aprobadas después de ambas correcciones.
- 6/6 pruebas Playwright aprobadas en Chrome con escritorio y emulación móvil, sobre build de producción: API HTTP 200, navegación A/B/C/D, revisión con teclado, TXT con referencias, impresión, invalidación, recarga, ausencia de persistencia, ausencia de solicitudes externas y nonce CSP.
- `npm run build` correcto; `git diff --check` correcto. Auditoría final tras actualizar e instalar Prettier: 0 vulnerabilidades reportadas por npm.
- Chromium de Playwright descargado al terminar; las pasadas registradas utilizaron Chrome instalado mediante PLAYWRIGHT_CHROMIUM_EXECUTABLE.
- Capturas reales: `screenshots/desktop-{evidencia,borrador,revision}.png` y equivalentes `mobile-*`. Se inspeccionaron visualmente; no son un test de persona.
- Escaneo de patrones de claves privadas/Gemini: sin coincidencias. `.env.example` solo tiene placeholders, la clave de pruebas es ficticia.
- Dirección local prevista: http://127.0.0.1:3000 . Sin URL pública, push o despliegue.

## Historial
- `a4de66e`: packet original, conservado.
- `f5e4d8d`: casos ficticios, catálogo y reglas con 12 pruebas.
- `afeabcf`: pantallas, revisión y exportación.
- `1f897e8`: adaptador y fallback con 32 pruebas.
- `900606a`: correcciones observadas de CSP/origen, regresiones aprobadas, capturas y formato legible.

## Pendiente externo
Dos despliegues y retest público (publicación aplazada por la usuaria), prueba de persona en chat nuevo, comparación con plantilla estática, grabación, PDFs de entrega y exportación íntegra de la conversación. No se afirma que estas actividades hayan ocurrido.
