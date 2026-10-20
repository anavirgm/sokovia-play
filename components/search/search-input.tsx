"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input, Spinner } from "@/components/ui";
import { SEARCH_MAX_QUERY_LENGTH } from "@/constants/search";

/**
 * Pausa de tecleo antes de consultar.
 *
 * Por debajo de ~300 ms cada palabra dispara una consulta mientras se escribe;
 * por encima de ~450 ms la espera se nota. 350 ms es el punto donde una persona
 * termina la palabra antes de que salga la petición.
 */
const DEBOUNCE_MS = 350;

/** URL de búsqueda: sin texto vuelve a la página limpia, sin `q`. */
function searchHref(text: string): string {
  return text.length > 0 ? `/search?q=${encodeURIComponent(text)}` : "/search";
}

type SearchInputProps = {
  /** Texto con el que llega la página desde la URL; pinta el primer render sin parpadeo. */
  initialQuery: string;
};

/**
 * Campo de búsqueda con debounce y navegación no bloqueante.
 *
 * El trabajo pesado —consultar TMDB y montar los resultados— ocurre en el
 * servidor, así que aquí no hay nada que diferir en local: el campo se actualiza
 * con cada tecla (urgente) y la URL se empuja dentro de `startTransition`
 * (interrumpible), de modo que mientras llega la respuesta se sigue viendo el
 * resultado anterior y el texto nunca se bloquea. Por eso no se usa
 * `useDeferredValue`: diferir un valor que nadie renderiza en local solo añadiría
 * una copia de estado sin efecto visible.
 *
 * El texto se considera dueño de la URL hasta que llega un cambio externo
 * (atrás/adelante). Se compara contra `committed` —lo último que este campo
 * puso en la URL— y no contra los parámetros actuales: si se sincronizara con
 * cada cambio, una navegación en vuelo borraría las teclas pulsadas después de
 * enviarla.
 */
export function SearchInput({ initialQuery }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  /** Último texto que este campo puso en la URL. */
  const committed = useRef(initialQuery);
  /** Texto que la URL está enseñando ahora mismo (puede venir de atrás/adelante). */
  const urlQuery = (searchParams.get("q") ?? "").trim().slice(0, SEARCH_MAX_QUERY_LENGTH);

  // Atrás/adelante cambian la URL sin pasar por el campo: el texto vuelve a
  // reflejar lo que se está viendo. Los cambios propios quedan fuera porque ya
  // coinciden con `committed`.
  useEffect(() => {
    if (urlQuery === committed.current) return;

    committed.current = urlQuery;
    setValue(urlQuery);
  }, [urlQuery]);

  // Una consulta por pausa de tecleo, no una por pulsación.
  useEffect(() => {
    const text = value.trim();
    if (text === committed.current) return;

    const timer = window.setTimeout(() => {
      committed.current = text;
      startTransition(() => router.replace(searchHref(text), { scroll: false }));
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [value, router]);

  // Enter no espera al debounce: quien pulsa intro ya ha decidido qué buscar.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = value.trim();
    if (text === committed.current) return;

    committed.current = text;
    startTransition(() => router.replace(searchHref(text), { scroll: false }));
  }

  function handleClear() {
    setValue("");

    if (committed.current === "") return;

    committed.current = "";
    startTransition(() => router.replace("/search", { scroll: false }));
  }

  return (
    <form
      role="search"
      aria-label="Buscar en el catálogo"
      onSubmit={handleSubmit}
      className="relative"
    >
      <label htmlFor="catalog-search" className="sr-only">
        Buscar películas por título
      </label>

      <Search
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />

      <Input
        id="catalog-search"
        type="search"
        name="q"
        value={value}
        size="lg"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        placeholder="Busca una película por su título…"
        onChange={(event) => setValue(event.target.value)}
        aria-controls="search-results"
        aria-busy={isPending || undefined}
        // El buscador nativo del navegador duplicaría el botón de borrar propio.
        className="h-14 rounded-xl pr-14 pl-12 text-base sm:h-16 sm:text-lg [&::-webkit-search-cancel-button]:appearance-none"
      />

      <span className="absolute top-1/2 right-2 -translate-y-1/2">
        {isPending ? (
          <span className="grid size-11 place-items-center">
            <Spinner size="sm" label="Buscando" />
          </span>
        ) : value.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Borrar la búsqueda"
            className="grid size-11 place-items-center rounded-lg text-muted transition-colors duration-200 ease-out-quart outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        ) : null}
      </span>
    </form>
  );
}
