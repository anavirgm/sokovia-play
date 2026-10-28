import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container>
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-surface">
            <FileQuestion className="size-8 text-muted" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Página no encontrada
            </h1>
            <p className="max-w-md text-pretty text-muted">
              La página que buscas no existe o ha sido movida.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className={cn(buttonVariants())}>
              Volver al inicio
            </Link>
            <Link href="/explore" className={cn(buttonVariants({ variant: "secondary" }))}>
              Explorar catálogo
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
