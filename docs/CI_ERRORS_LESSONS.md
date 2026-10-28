# Errores de CI y lecciones aprendidas

Este documento recoge todos los errores que hemos cometido con CI para evitarlos en el futuro.

## 1. Formato con Prettier
- **Error**: `pnpm format:check` falla
- **Causa**: Archivos sin formatear después de editar
- **Solución**: Siempre ejecutar `pnpm format` después de hacer cambios antes de commitear
- **Comando**: `pnpm format`

## 2. TypeScript - Uso de `any`
- **Error**: `@typescript-eslint/no-explicit-any` 
- **Causa**: Usar `any` para pasar objetos a componentes
- **Solución**: Usar `as unknown as TipoEspecifico` o `Parameters<typeof Componente>[0]["prop"]` para mantener tipado
- **Ejemplo**: `<MovieCard movie={movie as unknown as Parameters<typeof MovieCard>[0]["movie"]} />`

## 3. React Hooks - setState en useEffect
- **Error**: `react-hooks/set-state-in-effect` 
- **Causa**: Llamar `setState` síncronamente dentro de `useEffect`
- **Solución**: Añadir `// eslint-disable-next-line react-hooks/set-state-in-effect` con justificación, o reestructurar el código
- **Cuándo usar**: Solo cuando es necesario para sincronizar estado con props/externo

## 4. Mismatch de tipos TypeScript
- **Error**: `TS2561: Object literal may only specify known properties`
- **Causa**: Pasar propiedades con nombres incorrectos o estructura no coincidente con el tipo esperado
- **Solución**: Revisar el tipo del componente/función y ajustar las propiedades. Usar casting cuando sea necesario pero con cuidado

## 5. Next.js 16 con cacheComponents
- **Error**: `Route segment config "dynamic" is not compatible with nextConfig.cacheComponents`
- **Causa**: Usar `export const dynamic = "force-dynamic"` o `export const revalidate` con `cacheComponents: true` habilitado
- **Solución**: NO usar estas configuraciones. En su lugar:
  - Usar `<Suspense>` para envolver contenido dinámico
  - Separar lógica con `cookies()` en componentes envueltos en Suspense
  - Usar rutas dinámicas correctamente sin estas exports

## 6. Date.now() / valores inestables en prerender
- **Error**: `Next.js encountered the unstable value Date.now() while prerendering`
- **Causa**: Llamadas a `Date.now()`, `Math.random()`, etc. en Server Components durante prerender
- **Solución**: 
  - Hacer la ruta dinámica sin usar `export const dynamic` (usar otras estrategias)
  - Mover a Client Component
  - Usar `<Suspense>` o calcular en runtime

## 7. cookies() fuera de Suspense
- **Error**: `Route encountered uncached data during prerendering` con `createSupabaseServerClient()` (que usa `cookies()`)
- **Causa**: Acceder a `cookies()` directamente en Server Component sin Suspense cuando hay `cacheComponents`
- **Solución**: Crear un componente hijo que use `cookies()` y envolverlo con `<Suspense>` en el page

## 8. Lint en CI vs local
- **Error**: Diferentes resultados entre local y CI
- **Causa**: Diferentes versiones o configuración
- **Solución**: Siempre ejecutar `pnpm lint` localmente antes de pushear

## Checklist antes de commit
- [ ] `pnpm format` ejecutado
- [ ] `pnpm lint` sin errores (solo warnings aceptables)
- [ ] `pnpm typecheck` o `npx tsc --noEmit` sin errores
- [ ] No usar `any`
- [ ] No usar `export const dynamic`/`revalidate` con cacheComponents
- [ ] Añadir `Suspense` si hay acceso a `cookies()` o datos dinámicos
- [ ] Revisar imports no usados
