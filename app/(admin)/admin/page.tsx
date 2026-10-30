import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireAdmin } from "@/features/admin/guards";

export const instant = false;

export const metadata: Metadata = {
  title: "Panel de administración | VesperFlix",
  description: "Gestión de películas y fuentes.",
};

export default async function AdminPage() {
  const { user, profile } = await requireAdmin();

  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container className="flex flex-col gap-8 sm:gap-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium tracking-wide text-brand-soft uppercase">
              Administración
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Panel
            </h1>
            <p className="max-w-2xl text-pretty text-muted">
              Sesión: {user.email} · Rol: {profile.role}
            </p>
          </div>
          <SignOutButton />
        </header>

        <section className="rounded-xl border border-border bg-surface/80 p-6">
          <p className="text-muted">
            Panel en construcción. Aquí irá el CRUD de películas y gestión de movie_sources.
          </p>
        </section>
      </Container>
    </main>
  );
}
