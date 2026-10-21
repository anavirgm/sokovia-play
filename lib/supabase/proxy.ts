import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { clientEnv } from "@/lib/env/client";
import type { Database } from "@/types/database.types";

/**
 * Refresca la sesión de Supabase en cada request.
 *
 * En Next.js 16 el antiguo `middleware` se llama `proxy`; el archivo raíz
 * `proxy.ts` delega en esta función.
 *
 * Flujo:
 *  1. Se leen las cookies del request.
 *  2. Si hay cookies de sesión de Supabase, se llama a `auth.getUser()`,
 *     que valida el token contra Supabase Auth y, si expiró, lo refresca.
 *  3. Las cookies nuevas se escriben en el request (para los componentes que se
 *     renderizan después) y en la respuesta (para el navegador).
 *
 * Protección de rutas:
 *  Las rutas protegidas (`/account`) se guardan aquí de forma optimista:
 *  si no hay sesión válida, se redirige a `/login` con `?next=`.
 *  La autorización real siempre se valida en el servidor (páginas, acciones),
 *  nunca solo en el proxy.
 */

const PROTECTED_PATHS = ["/account"] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function hasSupabaseSessionCookie(request: NextRequest): boolean {
  // Las cookies de Supabase son chunked: sb-<ref>-auth-token.0, .1, ...
  // También puede existir sb-<ref>-auth-token en algunas configuraciones.
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.includes("-auth-token")) {
      return true;
    }
  }
  return false;
}

function buildLoginRedirect(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  // Optimización: sin cookies de sesión no hay nada que refrescar ni proteger.
  // Esto evita una llamada de red en cada visita anónima a rutas públicas.
  if (!hasSupabaseSessionCookie(request)) {
    if (isProtectedPath(request.nextUrl.pathname)) {
      return buildLoginRedirect(request);
    }
    return response;
  }

  const supabase = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // `getUser()` valida el JWT contra Supabase y refresca el token si caducó.
  // El resultado de la validación se usa para proteger rutas, pero el refresco
  // de cookies ya se ha aplicado en `setAll`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    return buildLoginRedirect(request);
  }

  return response;
}
