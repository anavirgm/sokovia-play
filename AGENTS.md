<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Diseño UI/UX (obligatorio)

Todo el código de interfaz de VesperFlix (componentes, páginas, layouts, estilos) se trabaja con estas skills globales de OpenCode, cargándolas con la herramienta `skill` antes de escribir o revisar UI:

- `ui-ux-pro-max` — criterio UI/UX, design system, tokens, tipografía, color, accesibilidad, gráficos y reglas de interacción.
- `impeccable` — dirección de diseño, jerarquía, layout, motion, copy de UX, auditoría y pulido.
- `taste-skill` — dirección de arte anti-genérico para páginas públicas (home, landing, páginas de marketing).

Reglas:

1. Cargar `ui-ux-pro-max` e `impeccable` antes de crear o modificar cualquier componente o página.
2. Cargar además `taste-skill` para páginas públicas (home, landing, detalle de película).
3. La identidad ya definida en `styles/globals.css` (tema oscuro cinematográfico, glassmorphism, `rounded-xl`) manda: las skills aportan criterio, no reemplazan la marca.
4. Verificar accesibilidad/contraste y todos los estados (hover, focus, disabled, loading, empty, error) según `ui-ux-pro-max`.
