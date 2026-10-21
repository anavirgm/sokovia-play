import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Calendar, Mail, Shield } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentProfile, getCurrentUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Mi cuenta | SokoviaPlay",
  description: "Gestiona tu cuenta y sesión en SokoviaPlay.",
};

/**
 * Página de cuenta protegida.
 *
 * Con `cacheComponents` habilitado, leer `cookies()` (a través de
 * `createSupabaseServerClient`) convierte la ruta en dinámica. No es necesario
 * `export const dynamic = "force-dynamic"` porque esa opción fue eliminada
 * en Next 16 con Cache Components; Next hace la ruta dinámica automáticamente.
 *
 * La verificación real de sesión ocurre aquí (defensa en profundidad).
 * El proxy también redirige de forma optimista, pero la página nunca confía solo en él.
 */
export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const profile = await getCurrentProfile();

  const displayName = profile?.display_name ?? user.email ?? "Usuario";
  const createdAt = user.created_at ? new Date(user.created_at) : null;
  const role = profile?.role ?? "user";

  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container className="flex flex-col gap-8 sm:gap-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-wide text-brand-soft uppercase">Cuenta</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Mi cuenta
          </h1>
          <p className="max-w-2xl text-pretty text-muted">
            Información de tu sesión y preferencias.
          </p>
        </header>

        <section className="mx-auto w-full max-w-2xl">
          <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface/80 p-6 shadow-[0_40px_120px_-80px_rgba(59,130,246,0.4)] backdrop-blur sm:p-8">
            <header className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold tracking-tight">{displayName}</h2>
              <p className="text-muted">Sesión activa</p>
            </header>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-sm text-muted">
                  <Mail className="size-4" aria-hidden="true" />
                  Correo electrónico
                </dt>
                <dd className="text-foreground">{user.email ?? "—"}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-sm text-muted">
                  <Shield className="size-4" aria-hidden="true" />
                  Rol
                </dt>
                <dd className="text-foreground">
                  {role === "admin" ? "Administrador" : "Usuario"}
                </dd>
              </div>
              {createdAt && (
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <dt className="flex items-center gap-2 text-sm text-muted">
                    <Calendar className="size-4" aria-hidden="true" />
                    Miembro desde
                  </dt>
                  <dd className="text-foreground">
                    {createdAt.toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <SignOutButton />
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
