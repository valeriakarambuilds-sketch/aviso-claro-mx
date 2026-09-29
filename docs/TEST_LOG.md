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
