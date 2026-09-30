# Registro de pruebas — 29 de septiembre de 2026

Registro cronológico con datos ficticios. Las primeras entradas corresponden a pruebas locales; ver el primer despliegue público del 30/09 al final. El feedback de persona es simulado y reportado por la usuaria.

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

## 29/09/2026 — referencias desplegables en Revisión

**Fallo reproducido sobre `cadb9d9`.** Se seleccionó el caso A, se preparó el borrador, se entró a Revisión y se marcó una frase. La nueva prueba hizo clic en A_LOGIN y A_INVESTIGATION («Ver respaldo ficticio») y A_IMPACT («Estado sin confirmar»). Ninguno mostró un panel: las tres comprobaciones de región visible fallaron. La URL terminó en `/#evidence-A_IMPACT`. La ejecución inicial dentro del sandbox no pudo acceder al puerto local; la reproducción real se hizo con Playwright fuera del sandbox.

**Causa.** Las referencias eran elementos `<a href="#evidence-ID">` dirigidos a tarjetas existentes en la columna de evidencia. Solo navegaban al ancla; no había estado de apertura, panel de detalle ni explicación específica. La prueba anterior recorría la revisión sin hacer clic en esas referencias, por lo que no detectó esta carencia.

**Corrección.** `EvidenceReference` sustituye el enlace por un botón que despliega un panel junto a su frase. Incluye ID, tipo de evidencia, fuente ficticia, estado vigente y explicación de qué permite afirmar o qué sigue sin confirmar. Si se retiró el respaldo, distingue la fuente original del estado actual y explica que ya no sostiene la afirmación. No consulta archivos reales ni autentica fuentes. El control usa `aria-expanded`/`aria-controls`, lleva el foco al panel visible y lo devuelve al botón al cerrar. El estado de apertura es independiente de las casillas, la aprobación y la versión; no modifica la URL. Cambiar evidencia o regenerar sigue invalidando la revisión como antes.

**Regresión.** `tests/e2e/references.spec.ts` recorre las siete referencias de A/B/C, comprueba título, fuente, estado y explicación en el panel, que su encabezado quede en el viewport, cierre con devolución de foco y apertura por teclado. Verifica conservación de revisión parcial, versión, URL y aprobación completa con exportación habilitada. También cubre A_LOGIN con respaldo retirado y exportación aún bloqueada. Se ejecuta en escritorio y viewport móvil con Chromium.

**Resultados.** 33/33 pruebas Vitest y 14/14 pruebas Playwright aprobadas (6 anteriores + 8 nuevas). Build de producción, TypeScript y `git diff --check` correctos. Las seis capturas del flujo se actualizaron durante la pasada de navegador. Sin llamadas reales a Gemini, push ni publicación. Aplicación local en http://127.0.0.1:3000 .

## 30/09/2026 — cierre de correcciones del primer persona test simulado

**Origen del feedback.** La usuaria reportó cinco confusiones del primer test de persona simulado: selección ficticia interpretada como confirmación real; «Referencias completas» percibido como validación del incidente; expectativa de texto distinto al regenerar; identificadores técnicos poco claros; rol de revisión confundido con aprobación independiente. Es feedback simulado comunicado por la usuaria, no una entrevista real ni una nueva sesión de persona realizada por el agente. Falta volver a mostrar las pantallas corregidas a esa persona simulada.

**Cambios terminados.** Antes de las evidencias se explica que las selecciones pertenecen al ejemplo y no confirman un incidente real; «Investigación iniciada» es un dato del caso. Se usa «Cada frase tiene una referencia» en un bloque neutral, junto a «La app no comprueba que el incidente ocurrió». «Preparar otra versión» advierte que el texto puede quedar igual y exige revisión nueva. Nombres como «Registro de acceso» son principales; los IDs se conservan como detalles secundarios en tarjetas, paneles y exportación. El rol de dueña se explica como representación dentro de la demo y la casilla como revisión no independiente ni autenticada. TXT e impresión siguen bloqueados hasta completar la revisión vigente.

**Versiones: comprobación, no bug supuesto.** Las capturas reportadas tenían versiones distintas, sin evidencia suficiente para atribuirlo a un fallo. En la sesión anterior se comprobó el build anterior `92ec510`: los casos A/B/C conservaron texto y versión al navegar Borrador → Revisión → Borrador → Revisión. Un primer intento de la prueba falló por buscar «2 Borrador» cuando el paso completado muestra ✓; se corrigió el selector, no la lógica de versiones. Las tres pruebas pasaron antes de aplicar el nuevo build. No se reprodujo divergencia y no se modificó la máquina de versiones.

**Validación final del 30/09.** `npm test`: 33/33. `npm run test:e2e`: 22/22 con Chromium, escritorio y móvil. Incluyen conservación de versión/texto, aclaraciones, referencias legibles y nueva versión con texto idéntico que borra casillas y vuelve a bloquear exportación. `npm run build`, comprobación de formato y `git diff --check`: correctos. Capturas locales del flujo actualizadas; no equivalen al retest de persona.

**Revisión previa a publicación.** Historial original conservado: siete commits previos a este cierre, incluido `a4de66e`. Escaneo de archivos y blobs del historial sin coincidencias para patrones de claves Gemini/GitHub/privadas/Stripe/OpenAI; esto no equivale a una garantía absoluta. No hay .env ni .env.local rastreados ni en el historial. Solo `.env.example`, con clave y modelo vacíos y GEMINI_ENABLED=false. `.vercel/` se ignora y `.vercelignore` excluye entorno local, historial y documentación del bundle de despliegue.

**Publicación autorizada.** El 30/09 la usuaria solicitó GitHub y primer deploy de producción, sustituyendo la instrucción previa de no publicar. Vercel autentica como `valeriakarambuilds-2805` en equipo Hobby. GitHub requiere login por navegador. Se registrarán únicamente URLs y commit verificados después de publicar; todavía no se declara un deploy en esta entrada.

## 30/09/2026 — primer despliegue de producción verificado

- Commit de aplicación desplegado: **`bf35c23c9991676be33529c6dd655a391f5fd417`** (octavo commit, historial original intacto).
- Producción: **https://aviso-claro-mx.vercel.app**.
- Despliegue inmutable: https://aviso-claro-i3w0gjbl7-valeriakarambuilds-2805s-projects.vercel.app . Su acceso puede estar protegido por Vercel; la URL pública comprobada es el alias de producción anterior.
- ID de despliegue: `dpl_HQzAQ8284YvCqGqCvpCBcRiHUFhi`. Creado el 30/09/2026 a las 11:27:49 America/Mexico_City. Vercel `inspect` confirmó `Ready`, destino `production`.
- Desplegado por CLI desde el árbol limpio del commit indicado; metadato `sourceCommit` fijado al mismo SHA. La conexión GitHub aún está pendiente de autenticar la cuenta; este despliegue no se presenta como un deploy disparado por GitHub.
- `GEMINI_ENABLED=false` fijado como configuración de producción. No se configuró GEMINI_API_KEY. Respuesta pública: `IA SIMULADA - PLANTILLA DEMO`, motivo «IA real desactivada. Se seleccionaron frases de la plantilla demo.»
- Antes de subir, `vercel deploy --dry --json` confirmó 30 archivos y excluyó `.env.local`, `.env.example`, `.git`, `.vercel`, `.next`, `node_modules`, `docs` y resultados locales. Vercel había creado `.env.local` al vincular el proyecto; permanece ignorado y no se imprimió su contenido.
- Auditoría actual de npm: 0 vulnerabilidades reportadas. Solo `.env.example` está rastreado en Git, sin claves; el escaneo del historial no encontró patrones de secretos.

### Comprobación pública sin sesión

Se consultó el alias con HTTP sin Authorization, cookies ni bypass de Vercel: **200**, sin redirigir a login. Se abrió Chromium en dos contextos nuevos con almacenamiento y cookies vacíos, tamaños 1280×900 y 390×844. En ambos se completó el caso A: banner demo y modo simulado visibles, POST `/api/draft` HTTP 200, mismo texto y «Caso ficticio A · Versión 3» en Borrador/Revisión, paneles de Registro de acceso e Impacto en archivos correctos, TXT bloqueado antes de revisar y descargable después de revisar cada frase y marcar el reconocimiento demo. No hubo errores JavaScript. Capturas: `screenshots/production-1280.png` y `screenshots/production-390.png`.

### GitHub pendiente

No hay todavía URL de repositorio ni push que declarar. GitHub CLI confirmó ausencia de sesión y se inició el login oficial por dispositivo; la usuaria debe completar la autorización en https://github.com/login/device. Si el código expira, puede generar uno nuevo ejecutando `/private/tmp/aviso-gh/gh_2.102.0_macOS_arm64/bin/gh auth login --hostname github.com --git-protocol https --web`. Tras autenticar: crear `aviso-claro-mx` con el historial existente, subirlo y ejecutar `vercel git connect` para vincularlo al proyecto Vercel ya creado. No es necesario inventar ni recrear el primer deploy.
