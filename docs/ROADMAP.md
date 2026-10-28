# VesperFlix — Roadmap de Desarrollo (Sprints + Issues + Commits)

> Arquitectura desacoplada: **Frontend Next.js (App Router)** en Vercel + **Supabase/PostgreSQL**. Integración obligatoria: **TMDB API** (metadatos) + **vidsrc.to** (embed película completa) + **YouTube** (tráiler).

## 1. Git, Commits Semánticos y Branching

### 1.1 Modelo
- Rama principal: `main` (protegida). No commits directos.
- Feature branches por issue: `feat/<id>-<slug>`, `fix/<id>-<slug>`, `refactor/<id>-<slug>`, `perf/<id>-<slug>`, `docs/<id>-<slug>`, `chore/<id>-<slug>`, `ci/<id>-<slug>`, `test/<id>-<slug>`, `build/<id>-<slug>`, `style/<id>-<slug>`.
- PR obligatorio → _Squash & Merge_ para historial lineal e impecable.

### 1.2 Commits (estilo simple)
Formato: `<tipo>: <descripción corta> closes #N`

```text
feat: add movie carousel closes #12
```

Reglas:
- Sin scope entre paréntesis.
- Descripción corta, en imperativo, minúscula, sin punto final.
- `closes #N` al final, en la misma línea (cierra el issue al hacer push). Si un commit cierra varios issues, se añade una línea `closes #N` por cada uno.
- Un commit = un cambio concreto.

Tipos: `feat, fix, refactor, perf, test, docs, chore, ci, build, style`.

Ejemplos:
- `feat: add vidsrc embed player closes #16`
- `feat: add TMDB rails and infinite scroll closes #9`
- `fix: resume playback from saved position closes #20`
- `refactor: extract MovieCard component`
- `docs: add RLS policy notes`

### 1.3 Versionado & Trazabilidad
- Tags semánticos: `v0.1.0` (Sprint 1), `v0.2.0` (Sprint 2), `v0.3.0` (Sprint 3), `v1.0.0` (Sprint 4 - Release candidato portafolio).
- Cada commit referencia su issue con `closes #N`.

## 2. SPRINT 1: Core Architecture & Database Setup
**Duración objetivo:** 1–2 días | **Meta:** Base sólida, tipos estrictos, layout oscuro cinematográfico.

### Issues
| ID | Título | Descripción | Criterios de Aceptación | Estim. |
|---|---|---|---|---|
| SF-101 | Scaffold Next.js + tooling | Crear app con App Router, TS strict, Tailwind, path aliases `@/*`, ESLint/Prettier, `.gitignore`. | Build/lint/typecheck OK. Estructura limpia. | XS |
| SF-102 | Arquitectura de carpetas | Definir `app/`, `components/`, `features/`, `lib/`, `hooks/`, `types/`, `utils/`, `constants/`, `actions/`, `styles/`. | Carpetas coherentes con separación Server/Client. | XS |
| SF-103 | Supabase setup + env validation | Crear clientes: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/admin.ts` (service role) y `lib/supabase/proxy.ts` (refresco de sesión, invocado desde `proxy.ts` raíz — el `middleware.ts` de Next ≤15). Validar el entorno con Zod (`lib/env/client.ts` + `lib/env/server.ts`). Nunca exponer `SERVICE_ROLE_KEY` al cliente. | Validación falla con env incompleto. Clientes tipados. | S |
| SF-104 | Tipos compartidos + TMDB types | `types/database.types.ts` escrito a mano y sincronizado con `supabase/schema.sql` (sin depender del CLI) + crear `types/tmdb.ts` (movie/list/genre/videos) y barrel `types/index.ts`. Tipado estricto, `noImplicitAny`, `strictNullChecks`. | Tipos centralizados, reutilizables. | S |
| SF-105 | UI primitives + tokens | Crear `<Button>`, `<Skeleton>`, `<Badge>`, `<Input>`, `<Spinner>`. Tokens CSS: variables para paleta `zinc-950/slate-950`, glassmorphism, bordes `rounded-xl`. | Accesibles, variantes claras, animaciones sutiles. | S |
| SF-106 | Layout base (Header/Footer) + tema oscuro | Layout App Router con `<Header/>`, `<Footer/>`, `<ThemeProvider>` (dark default). Tipografías Inter/Geist. Jerarquía visual cinematográfica. | Mobile-first, sin desajustes. Dark mode único. | S |
| SF-107 | CI base + git hooks | GitHub Actions: `lint`, `typecheck`, `build`. Husky + lint-staged + commitlint (Conventional Commits). | CI verde en PR. Hooks bloquean commits inválidos. | XS |

**Definition of Done (Sprint 1):** `pnpm/npm run lint`, `typecheck`, `build` OK. Schema aplicado a Supabase. Tipos generados. Layout base renderiza impecable.

**Commits ejemplo:** `feat: setup Next.js app router and folder structure`.

## 3. SPRINT 2: TMDB Catalog, Search & Infinite Scroll
**Duración objetivo:** 2–3 días | **Meta:** Catálogo vivo desde TMDB, UX tipo Netflix/Disney+/HBO Max.

### Issues
| ID | Título | Descripción | Criterios de Aceptación | Estim. |
|---|---|---|---|---|
| SF-201 | TMDB API client | Cliente tipado (`lib/tmdb/client.ts`) con `fetch` + revalidación. Endpoints: `popular`, `trending`, `top_rated`, `discover`, `genres`, `search`, `details`, `videos`. Usar `NEXT_PUBLIC_TMDB_API_KEY` solo vía route handlers/Server Actions o server utils (nunca hardcode). | Errores centralizados, tipado estricto. | S |
| SF-202 | Hero banner dinámico | `<Hero/>` con backdrop TMDB, título, overview truncado, CTAs "Ver ahora"/"Ver tráiler", overlay degradado. SSR/ISR según ruta. | Responsive, fade-in sutil, textos legibles. | S |
| SF-203 | MovieCard + MovieSlider | Componentes reutilizables. `<MovieCard/>`: poster, título, año, vote, hover scale+shadow, overlay info. `<MovieSlider/>`: carrusel horizontal con `scroll-snap`, flechas, drag suave (mobile). | Microinteracciones fluidas, accesibles. | M |
| SF-204 | Home: rails por género | Página `/` con rails: Trending, Popular, Top Rated + por géneros. Render Server Components con fetch TMDB + caching. Skeletons durante carga. | LCP optimizado, ISR configurable. | M |
| SF-205 | Search con debounce | `/search` + `<SearchInput/>`. Debounce 300–400ms, `useDeferredValue`/`useTransition`. Búsqueda TMDB con paginación/infinite scroll. Estados vacíos elegantes. | Sin re-render excesivo. UX fluida. | M |
| SF-206 | InfiniteScrollGrid + filtros género | `<InfiniteScrollGrid/>` con IntersectionObserver. `/genres/[slug]`, `/explore` con filtro por género. Mantener scroll, estados `loading/error/end`. | Performance estable con listas grandes. | M |
| SF-207 | Loading skeletons + error boundaries | `loading.tsx` global/local, `error.tsx`, `<MovieCardSkeleton/>`, `<SliderSkeleton/>`, `<HeroSkeleton/>`. Mensajes claros, retry. | UX consistente, animaciones pulidas. | S |

**Definition of Done:** Home con carruseles, búsqueda funcional, infinite scroll estable, skeletons impecables.

**Commits ejemplo:** `feat: add TMDB client`; `feat: add movie sliders and infinite scroll`.

## 4. SPRINT 3: Multi-Server Player (vidsrc.to + YouTube), Auth & Watch History
**Duración objetivo:** 2–3 días | **Meta:** Reproducción híbrida + auth + "Continuar Viendo" + Favoritos.

### Issues
| ID | Título | Descripción | Criterios de Aceptación | Estim. |
|---|---|---|---|---|
| SF-301 | Supabase Auth | Auth con email/password + magic link. Forms con validación, estados loading/success/error. Persistencia SSR. Proxy para proteger rutas `/account`, `/watch/*` según caso. | Flujo completo, mensajes UX claros. | M |
| SF-302 | Proxy + guards server-side | `proxy.ts`: refresco de sesión, redirecciones. Guards en layouts/page.tsx server-side (role check vía profiles). Nunca confiar solo en client. | Seguridad correcta, sin flashes. | S |
| SF-303 | Movie detail page | `/movies/[tmdb_id]` SSR. Obtener detalles TMDB + videos (para trailer). Mostrar poster/backdrop, overview, géneros, rating, año. CTAs: "Ver película", "Añadir a favoritos", "Ver tráiler". | SEO-friendly, datos consistentes. | S |
| SF-304 | VideoPlayer + ServerSelector | `<VideoPlayer/>` modular: soporta `youtube` (lite/iframe) y `embed` (vidsrc.to). `<ServerSelector/>` dinámico: lista `movie_sources` activos ordenados por `sort_order`. Persistir último servidor elegido (localStorage). | Cambio fluido entre servidores sin recarga brusca. | M |
| SF-305 | Watch page con vidsrc.to como principal | `/watch/[tmdb_id]` SSR. Determinar servidor principal: priorizar `embed` (vidsrc.to) con `sort_order` menor (p.ej. 0). Fallback a trailer YouTube si no hay embed activo. Mostrar info película + selector. | URL limpia, iframe seguro, UX cinematográfica. | M |
| SF-306 | Favoritos (optimistic UI) | Features favoritos: toggle, count, `/favorites`. Server Actions + revalidación. Optimistic updates con rollback. Unicidad garantizada por DB. | Sin duplicados, feedback inmediato. | S |
| SF-307 | Watch history + "Continuar Viendo" | Guardar `last_position_seconds` + `duration_seconds` con throttle (1–2s). Upsert en `watch_history`. Rail "Continuar Viendo" en home con progreso visual (%). Botón "Reanudar" en card/detalle. | Precisión razonable, no spam DB. | M |
| SF-308 | UX polish player | Controles claros, estados loading/error, skeleton player, pantalla "Servidor no disponible", autoplay? respetuoso, mobile fullscreen. | Impecable visualmente, responsive. | S |

**Definition of Done:** Reproducción con vidsrc.to + YouTube, auth funcional, favoritos + watch history con resume.

**Commits ejemplo:** `feat: add multi-server video player`; `feat: save and resume watch position`.

## 5. SPRINT 4: Admin Dashboard & Security Hardening
**Duración objetivo:** 1–2 días | **Meta:** Gestión admin en tiempo real + blindaje + release portafolio.

### Issues
| ID | Título | Descripción | Criterios de Aceptación | Estim. |
|---|---|---|---|---|
| SF-401 | Admin guard + layout protegido | Ruta `/admin` con server-side guard: requiere `auth.uid()` + `profiles.role='admin'`. Layout con navegación admin, acceso denegado elegante. | Solo admins acceden. Redirecciones correctas. | S |
| SF-402 | AdminTable + CRUD películas | `<AdminTable/>` para películas: buscar/filtrar, paginar. Crear/editar vía Server Actions + Zod validation. Revalidar rutas con `revalidatePath`. Toasts de éxito/error. | CRUD robusto, validación estricta. | M |
| SF-403 | Gestión movie_sources (multi-servidor) | UI para añadir/editar fuentes: `name`, `type` (youtube/embed), `url`, `quality`, `sort_order`, `is_active`. Validar URLs (http/https). Sugerir formato `https://vidsrc.to/embed/movie/{tmdb_id}`. | Previene URLs inválidas. Orden correcto en selector. | M |
| SF-404 | Realtime updates | Integrar Supabase Realtime en `/admin/movies` y `/admin/sources` (Postgres Changes). Actualizaciones live sin full refresh. | Sin memory leaks, cleanup correcto. | S |
| SF-405 | Error handling centralizado | `error.tsx`, `global-error.tsx`, `not-found.tsx`. Logging seguro (sin PII). Mapear errores auth/DB. | Experiencia unificada. | S |
| SF-406 | Security hardening (headers + CSP) | Añadir cabeceras HTTP vía `next.config.ts`/`proxy.ts`: `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`. Permitir `frame-src` para `https://www.youtube.com`, `https://youtube.com`, `https://vidsrc.to`, `https://vidsrc.xyz`. `X-Frame-Options: SAMEORIGIN` (coherente con embeds). | Headers presentes. CSP no bloquea embeds requeridos. | M |
| SF-407 | Performance + SEO | ISR donde aplique (home/genres), `next/image` con sizes, `dynamic()` para `VideoPlayer`, prefetch selectivo, `loading.tsx`. Meta tags OpenGraph. Lighthouse objetivo ≥95 (Performance/Accessibility/Best Practices/SEO). | Métricas alineadas a portafolio. | S |
| SF-408 | QA, .env.example, README final | Checklist QA: responsive 320–1440px, empty states, auth flows, resume, favoritos, admin CRUD, RLS sanity check. Crear `.env.example` completo (sin secretos). README con stack, arquitectura, features, setup, decisiones técnicas. | Entregable pulido, listo para demo. | S |

**Definition of Done (v1.0.0):** Admin funcional, realtime OK, headers seguros, Lighthouse ≥95, docs completas.

**Commits ejemplo:** `feat: add admin dashboard`; `feat: add security headers and CSP`.

## 6. Checklist de Calidad (Portafolio)
- [ ] Tipado 100% estricto (sin `any`, sin `@ts-ignore`)
- [ ] Componentes modulares: `<MovieCard/>, <MovieSlider/>, <VideoPlayer/>, <ServerSelector/>, <InfiniteScrollGrid/>, <AdminTable/>`
- [ ] Server/Client separation correcta (App Router)
- [ ] RLS aplicado + guards server-side
- [ ] TMDB + vidsrc.to + YouTube integrados
- [ ] Skeletons + microinteracciones
- [ ] Glassmorphism + paleta cinematográfica
- [ ] Mobile-first + alineaciones impecables
- [ ] Commit history semántico + PRs
- [ ] `.env.local` nunca committeado; `.env.example` sin secretos

## 7. Roadmap visual
| Fase | Sprint | Estado |
|---|---|---|
| Arquitectura | Sprint 1 | Pendiente |
| Catálogo | Sprint 2 | Pendiente |
| Reproducción+Auth | Sprint 3 | Pendiente |
| Admin+Hardening | Sprint 4 | Pendiente |

**Siguiente paso recomendado:** Ejecutar schema.sql en Supabase → iniciar **Sprint 1 (SF-101)** con scaffolding Next.js.
