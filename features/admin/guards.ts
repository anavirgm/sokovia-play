import "server-only";

import { redirect } from "next/navigation";

import { getCurrentProfile, getCurrentUser } from "@/features/auth/session";

/**
 * Exige acceso al panel de administración.
 *
 * Verificación server-side obligatoria:
 * 1. Debe haber sesión autenticada
 * 2. El perfil debe tener role === 'admin' (comprobado en la tabla profiles)
 *
 * Nunca se confía únicamente en el cliente. El proxy hace una redirección
 * optimista, pero este guard es la fuente de verdad.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    // Si está logueado pero no es admin, le mandamos al catálogo.
    // No revelamos que existe un panel admin.
    redirect("/");
  }

  return { user, profile };
}
