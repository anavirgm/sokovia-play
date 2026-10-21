import { Container } from "@/components/layout/container";

/**
 * Fallback de carga para la página de cuenta.
 * Replica la estructura del `<main>` para evitar cambio de layout.
 */
export default function AccountLoading() {
  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container className="flex flex-col gap-8 sm:gap-10">
        <header className="flex flex-col gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-surface-hover/60" />
          <div className="h-9 w-40 animate-pulse rounded bg-surface-hover/60 sm:h-10 sm:w-52" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-surface-hover/60" />
        </header>

        <section className="mx-auto w-full max-w-2xl">
          <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface/80 p-6 sm:p-8">
            <header className="flex flex-col gap-2">
              <div className="h-6 w-48 animate-pulse rounded bg-surface-hover/60" />
              <div className="h-4 w-24 animate-pulse rounded bg-surface-hover/60" />
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-28 animate-pulse rounded bg-surface-hover/60" />
                <div className="h-4 w-40 animate-pulse rounded bg-surface-hover/60" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-16 animate-pulse rounded bg-surface-hover/60" />
                <div className="h-4 w-20 animate-pulse rounded bg-surface-hover/60" />
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <div className="h-10 w-36 animate-pulse rounded-xl bg-surface-hover/60" />
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
