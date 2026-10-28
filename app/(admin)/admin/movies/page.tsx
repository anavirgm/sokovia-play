import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Film } from "lucide-react";

export const metadata: Metadata = {
  title: "Gestión de películas | Admin | SokoviaPlay",
};

export default function AdminMoviesPage() {
  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-wide text-brand-soft uppercase">
            Administración
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Películas
          </h1>
          <p className="max-w-2xl text-pretty text-muted">
            Gestión del catálogo de películas. Próximamente: añadir, editar y eliminar.
          </p>
        </header>

        <section className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface/60 py-16 text-center">
          <Film className="size-12 text-muted" aria-hidden="true" />
          <div className="flex flex-col gap-2">
            <p className="text-lg font-medium">En construcción</p>
            <p className="max-w-md text-pretty text-muted">
              El CRUD de películas estará disponible próximamente.
            </p>
          </div>
        </section>
      </Container>
    </main>
  );
}
