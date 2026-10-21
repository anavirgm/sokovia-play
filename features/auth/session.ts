import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

/**
 * Obtiene el usuario autenticado desde la sesión SSR.
 *
 * Usa las cookies del request (gestionadas por @supabase/ssr y refrescadas
 * en proxy.ts). Nunca lee de localStorage: la sesión vive en cookies HttpOnly.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

/**
 * Obtiene la sesión completa (acceso a tokens solo si es estrictamente necesario).
 * Para la mayoría de los casos `getCurrentUser()` es suficiente.
 */
export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  return data.session;
}

/**
 * Obtiene el perfil del usuario autenticado desde la tabla `profiles`.
 *
 * El perfil se crea automáticamente por el trigger `handle_new_user` al
 * registrarse. Si no existe (caso raro), se devuelve null.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Exige que haya un usuario autenticado. Si no lo hay, redirige a /login.
 *
 * Úsalo en páginas/componentes de servidor que requieran sesión.
 * `next` se usa para volver al destino tras iniciar sesión.
 */
export async function requireUser(nextPath = "/account"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const params = new URLSearchParams();
    params.set("next", nextPath);
    redirect(`/login?${params.toString()}`);
  }
  return user;
}
