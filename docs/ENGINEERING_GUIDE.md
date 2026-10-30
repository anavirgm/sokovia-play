# VesperFlix — Guía de Ingeniería, Calidad y Ciberseguridad

> Orientado a Clean Code, SOLID, seguridad web y rendimiento. Aplicable durante todo el desarrollo (Sprints 1–4).

## 1. Seguridad Web

### 1.1 Prevención XSS
- React escapa por defecto. **Prohibido** usar `dangerouslySetInnerHTML`.
- Si inevitable: sanitizar con `dompurify` + CSP estricto.
- Validar/sanitizar inputs en cliente (UX) y **siempre** en servidor (Server Actions + Zod).
- Evitar interpolación insegura con URLs externas. Validar `http(s)`.

### 1.2 Protección contra Inyección SQL
- **Usar ÚNICAMENTE clientes oficiales Supabase** (`@supabase/supabase-js`).
- Usar consultas parametrizadas (el cliente lo hace). **Nunca concatenar strings SQL**.
- Aplicar **RLS estricta** como defensa en profundidad (políticas por tabla/rol).
- Acceso admin: validación server-side + `is_admin()` + middleware/layout guards.
- `SERVICE_ROLE_KEY` **nunca** en bundle cliente. Usar solo en server utils/route handlers con `import 'server-only'`.

### 1.3 Cabeceras HTTP Recomendadas
Configurar en `next.config.ts` (`headers()`):

| Header | Valor | Justificación |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forzar HTTPS |
| `X-Content-Type-Options` | `nosniff` | Evitar MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controlar referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Minimizar permisos |
| `X-Frame-Options` | `SAMEORIGIN` | Coherente con embeds propios; externos se cargan vía iframe permitido por CSP |
| `Content-Security-Policy` | Ver abajo | Control granular de orígenes |

**CSP sugerida (alineada a TMDB + vidsrc.to + YouTube):**
```text
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';  /* ajustar tras hardening */
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://image.tmdb.org https://www.themoviedb.org;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co https://api.themoviedb.org;
frame-src 'self' https://www.youtube.com https://youtube.com https://vidsrc.to https://vidsrc.xyz;
media-src 'self' https://www.youtube.com;
object-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

> Tras estabilizar, eliminar `'unsafe-inline'/'unsafe-eval` si posible.

### 1.4 Variables de Entorno Seguras
`.env.local` **nunca** commiteado. Usar `.env.example` sin valores reales.

**Requeridas:**
- `NEXT_PUBLIC_SUPABASE_URL` (público)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (público, RLS aplica)
- `SUPABASE_SERVICE_ROLE_KEY` (privado, server-only)
- `TMDB_API_KEY` (privado si usado vía route handlers; **no** exponer como `NEXT_PUBLIC_*`)
- `TMDB_BASE_URL` (p. ej. `https://api.themoviedb.org/3`)

Reglas: marcar server-only con `import 'server-only'`. Validar con Zod en arranque (fail fast).

## 2. Arquitectura, SOLID y Limpieza de Código

### 2.1 Principios SOLID
| Principio | Aplicación en VesperFlix |
|---|---|
| S (Single Responsibility) | Componentes pequeños (MovieCard solo presentación). Utils puras. |
| O (Open/Closed) | Primitivas UI extensibles por props/variants (class-variance-authority). |
| L (Liskov Substitution) | Tipos consistentes, evitar narrowing confuso. |
| I (Interface Segregation) | Tipar mínimos (`Pick`, `Omit`). Evitar interfaces gigantes. |
| D (Dependency Inversion) | Depender de abstracciones/types, no implementaciones concretas. Inyectar clientes (tmdb/supabase). |

### 2.2 Server Components vs Client Components
- **Server Components (por defecto):** fetch TMDB, queries Supabase server-side, SEO, ISR/SSR.
- **Client Components (`'use client'`):** interactividad (sliders, player, forms, toasts, realtime).
- Pasar datos serializables desde Server→Client. Evitar pasar funciones innecesarias.
- Mantener lógica pesada en servidor (Server Actions).

### 2.3 Estructura de Carpetas (objetivo Sprint 1)
```text
vesperflix/
├── app/                    # App Router (routes, layouts, loading.tsx, error.tsx, not-found.tsx, global-error.tsx)
│   ├── (auth)/             # auth routes
│   ├── (public)/           # home/explore/search/movies/watch/favorites
│   ├── admin/              # dashboard protegido (role=admin)
│   └── api/                # route handlers (si necesario)
├── components/             # UI reutilizables cross-feature
│   ├── ui/                 # primitives (Button, Input, Skeleton...)
│   ├── layout/             # Header/Footer
│   └── shared/             # MovieCard, MovieSlider, VideoPlayer, ServerSelector, InfiniteScrollGrid, AdminTable
├── features/               # feature slices (auth, catalog, player, admin)
├── lib/                    # clientes (supabase, tmdb), utils, config, env
├── hooks/                  # custom hooks cliente
├── actions/                # Server Actions (auth, favorites, watch-history, admin CRUD)
├── types/                  # database.types.ts, tmdb.ts, app types
├── utils/                  # helpers puros (format, cn)
├── constants/              # rutas, queries, config
└── styles/                 # globals.css
```

### 2.4 Estados, Errores y Carga
- `loading.tsx` por ruta (skeletons animados).
- `error.tsx` + `global-error.tsx` con retry.
- `not-found.tsx` elegante.
- Skeletons profesionales: pulse/shimmer sutil.
- Feedback inmediato: toasts, disabled states, optimistic UI (con rollback).

### 2.5 Convenciones TypeScript
- `strict: true`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`.
- Preferir `type` sobre `interface`. `type` para unions/intersections.
- `as const` cuando útil. Evitar `any`/`unknown` sin justificación.
- Validación runtime con Zod (env, forms, Server Actions).
- Tipos DB en `types/database.types.ts`, escritos a mano y sincronizados con `supabase/schema.sql` (sin dependencia del CLI de Supabase). Barrels en `types/index.ts` re-exportados con `export type *`.

### 2.6 Convenciones Código
- Nombres descriptivos, funciones pequeñas.
- Early returns. Evitar anidación profunda.
- Comentarios: explicar **por qué**, no **qué**.
- Imports ordenados (lib→features→components→types). Usar aliases `@/`.
- Componentes: PascalCase. Hooks: `useX`. Utils: camelCase.
- Archivos colocation razonable.

## 3. Optimización de Rendimiento

### 3.1 SSR vs ISR (estrategia por ruta)
| Ruta | Estrategia | Revalidación | Razón |
|---|---|---|---|
| `/` (home) | **ISR** | 60–300s | Rails TMDB cambian con frecuencia moderada. Balance SEO+velocidad. |
| `/movies/[tmdb_id]` | **SSR** | on-demand + cache tags | Detalles frescos + SEO crítico. |
| `/watch/[tmdb_id]` | **SSR** | mínima | Requiere estado fuentes activas + auth context. |
| `/genres/[slug]` | **ISR** | 300s | Listados grandes, estable. |
| `/explore` | **SSR/ISR** híbrido | según filtros | Búsqueda dinámica. |
| `/search` | **SSR** | no-store o corto | Resultados en tiempo real. |
| `/favorites`, `/account` | **SSR (dynamic)** | `force-dynamic` | Datos usuario privados. |
| `/admin/*` | **dynamic** | `force-dynamic` | Siempre fresco + realtime. |

### 3.2 Técnicas
- `next/image`: usar `sizes`, `priority` solo LCP, formatos WebP/AVIF.
- `dynamic(import(), { ssr: false })` para `<VideoPlayer/>` (iframe pesado).
- `loading.tsx` + Suspense donde convenga.
- Prefetch mínimo en mobile.
- `useDeferredValue`/`useTransition` en búsquedas/filtros.
- Throttling en `watch_history` saves (no `setInterval` agresivo).
- Evitar re-renders: `memo`, `useCallback` solo si necesario.
- CSS crítico mínimo, evitar libs pesadas.

### 3.3 Caching TMDB
- Server fetch con `next: { revalidate }` o `fetch(..., { next: { tags: ['tmdb:home'] } })`.
- Invalidar con `revalidatePath`/`revalidateTag` tras admin CRUD.
- Route handlers con `Cache-Control` apropiado.

## 4. Calidad de Código, Testing, CI

### 4.1 Linting, Formateo, Git Hooks
- **ESLint** + `@typescript-eslint` estricto.
- **Prettier** para consistencia.
- **lint-staged:** formatea/linta solo staged.
- **commitlint:** valida el formato `<tipo>: <descripción corta>` (sin scope).
- **Husky:** `pre-commit`, `commit-msg`.

### 4.2 TypeScript Checking
- `tsc --noEmit` obligatorio en CI.
- `verbatimModuleSyntax: true` (recomendado).
- `moduleResolution: bundler`.

### 4.3 Testing (mínimo viable para robustez)
- **Unit:** Vitest + Testing Library para hooks/primitivas.
- **E2E:** Playwright para flows críticos (auth, ver película, favoritos, resume).
- Enfoque pragmático: priorizar lógica crítica (`watch-history` position calc).

### 4.4 CI Pipeline (GitHub Actions)
Pasos por PR:
1. Checkout
2. Setup Node + pnpm/npm cache
3. Install deps
4. Lint
5. Typecheck (`tsc --noEmit`)
6. Build
7. (opcional) Unit tests
8. (opcional) Lighthouse CI en preview

Todos deben pasar para merge.

### 4.5 Seguridad Adicional
- Rate limiting en route handlers sensibles (login/magic link) si se añaden.
- CSRF mitigado por SameSite cookies + Server Actions.
- No loggear tokens/PII.
- Validar URLs externas para embeds (whitelist: `vidsrc.to`, `vidsrc.xyz`, `youtube.com`, `youtu.be`).
- Sanitizar query params.
- Revisar dependencias (`npm audit`/`pnpm audit`) periódicamente.

## 5. Checklist Pre-merge
- [ ] Lint + typecheck + build OK
- [ ] RLS verificado manualmente (anon/auth/admin)
- [ ] Componentes usan Server/Client correcto
- [ ] Skeletons + error/loading presentes
- [ ] Responsive probado 320/768/1024/1440
- [ ] Sin `any`, sin console.log debug
- [ ] Accesibilidad básica (alt, labels, focus)
- [ ] Commit semántico + issue referencia
- [ ] `.env.example` actualizado
- [ ] No secretos en diff

## 6. Notas sobre Integración vidsrc.to
- Usar embed directo: `https://vidsrc.to/embed/movie/{tmdb_id}`.
- Servidor **principal** = `embed` con `sort_order = 0`, `is_active = true`.
- Mostrar fallback "Servidor no disponible" si iframe falla.
- CSP debe permitir `frame-src` para `vidsrc.to`/`vidsrc.xyz`.
- X-Frame-Options SAMEORIGIN no bloquea iframes externos (solo si nuestra página fuera embebida).
- Evitar proxys no necesarios (simplifica CORS/CSP).

## 7. Métricas Objetivo (Portafolio)
| Métrica | Objetivo | Herramienta |
|---|---|---|
| Lighthouse Performance | ≥ 95 | Chrome DevTools/Lighthouse CI |
| Lighthouse Accessibility | ≥ 95 | Lighthouse |
| Best Practices | ≥ 95 | Lighthouse |
| SEO | ≥ 95 | Lighthouse |
| CLS/LCP/INP | < 0.1 / < 2.5s / < 200ms | Web Vitals |
| Type Coverage | 100% (estricto) | tsc |

**Principio rector:** *"Impecable, mantenible, seguro y demostrable".* Todo cambio debe reflejar calidad senior.
