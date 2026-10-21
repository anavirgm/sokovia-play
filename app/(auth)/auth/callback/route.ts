import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Callback de autenticación (magic link / confirmación de email).
 *
 * Supabase redirige aquí con `?code=` tras hacer clic en el enlace.
 * Intercambiamos el code por una sesión (cookies HttpOnly) y redirigimos
 * al destino (`next`) o a `/account`.
 *
 * La URL base para las redirecciones viene de `request.nextUrl.origin` (el
 * origen real de la petición), que funciona tanto en dev como en producción.
 */
function sanitizeNextPath(raw: string | null): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/")) return "/account";
  if (raw.startsWith("//")) return "/account";
  if (raw.startsWith("/login")) return "/account";
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Si falla el intercambio, llevamos al login con un mensaje genérico
    // (no exponemos el detalle del error).
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // Sin código: redirigir al login
  return NextResponse.redirect(`${origin}/login`);
}
