import Link from "next/link";
import { Clapperboard, SearchX, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui";
import { cn } from "@/utils/cn";

/**
 * Estados de la búsqueda: sin consulta, sin resultados y error.
 *
 * Los tres comparten el mismo armazón para que la página no cambie de forma
 * según lo que devuelva TMDB: icono, un titular y una salida. Una búsqueda sin
 * resultados no es un callejón sin salida, y un error de TMDB tampoco.
 */

/**
 * Búsquedas de ejemplo del estado inicial.
 *
 * Son títulos reales comprobados contra TMDB en español; una sugerencia que no
 * devolviera nada sería peor que no sugerir. Se escriben como términos de
 * búsqueda —no como enlaces a fichas— porque las fichas aún no existen (#18).
 */
const SUGGESTIONS = ["Dune", "Oppenheimer", "El padrino", "Interstellar"] as const;

type SearchMessageProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  /** Salidas: sugerencias, enlaces al catálogo. */
  children?: ReactNode;
};

function SearchMessage({ icon, title, description, children }: SearchMessageProps) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-border/70 bg-surface/40 px-6 py-14 text-center sm:py-16">
      <span className="grid size-14 place-items-center rounded-xl bg-brand/10 text-brand-soft ring-1 ring-brand/20 ring-inset">
        {icon}
      </span>

      <div className="flex max-w-md flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-balance">{title}</h2>
        <p className="text-sm text-pretty text-muted">{description}</p>
      </div>

      {children}
    </div>
  );
}

/** Píldoras de búsquedas de ejemplo: un atajo, no la única forma de empezar. */
function SuggestionLinks({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <ul className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((term) => (
          <li key={term}>
            <Link
              href={`/search?q=${encodeURIComponent(term)}`}
              className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors duration-200 ease-out-quart outline-none hover:border-brand/60 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {term}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Estado inicial: no hay consulta, así que no se ha llamado a TMDB. */
export function SearchIdle() {
  return (
    <SearchMessage
      icon={<Clapperboard className="size-6" aria-hidden="true" />}
      title="¿Qué quieres ver hoy?"
      description="Escribe el título de una película y los resultados aparecerán aquí. Sin prisa: puedes empezar por una de estas búsquedas."
    >
      <SuggestionLinks label="Búsquedas de ejemplo" />
    </SearchMessage>
  );
}

/** La consulta llegó a TMDB, pero no hubo coincidencias. */
export function SearchNoResults({
  text,
  page,
  totalResults,
}: {
  text: string;
  page: number;
  totalResults: number;
}) {
  // Una página fuera de rango (URL manipulada o resultados acortados) devuelve
  // cero títulos igual que una búsqueda sin coincidencias, pero el consejo es
  // otro: no hay que corregir la ortografía, hay que volver al principio. Si la
  // búsqueda no tiene ningún resultado, la página 2 no cambia el mensaje.
  if (page > 1 && totalResults > 0) {
    return (
      <SearchMessage
        icon={<SearchX className="size-6" aria-hidden="true" />}
        title="Esta página ya no tiene resultados"
        description={`La búsqueda de «${text}» no llega tan lejos. Vuelve al principio y sigue desde ahí.`}
      >
        <Link
          href={`/search?q=${encodeURIComponent(text)}`}
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          Ver desde el principio
        </Link>
      </SearchMessage>
    );
  }

  return (
    <SearchMessage
      icon={<SearchX className="size-6" aria-hidden="true" />}
      title={`Sin resultados para «${text}»`}
      description="Prueba con otro título, revisa la ortografía o explora el catálogo por género. A veces el nombre en español no es el que recordamos."
    >
      <SuggestionLinks label="Prueba con" />
    </SearchMessage>
  );
}

/** TMDB no respondió, o respondió algo que no se puede usar. */
export function SearchError({ message }: { message: string }) {
  return (
    <SearchMessage
      icon={<TriangleAlert className="size-6" aria-hidden="true" />}
      title="No pudimos buscar"
      description={message}
    >
      <Link href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
        Volver al catálogo
      </Link>
    </SearchMessage>
  );
}
