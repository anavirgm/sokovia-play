import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";

import {
  BrowseResults,
  BrowseResultsFallback,
  GenreHeaderFallback,
  GenreNav,
  GenreNavSkeleton,
} from "@/components/catalog";
import { Container } from "@/components/layout/container";
import { MOVIE_GENRES, genreBySlug } from "@/constants/genres";
import { getBrowsePage } from "@/features/catalog/browse";

/**
 * Página de un género: `/genres/accion`, `/genres/ciencia-ficcion`…
 *
 * Es la URL canónica de cada filtro. Tiene cabecera y copy propios —el nombre
 * del género y una línea editorial— para que el enlace signifique algo cuando se
 * comparte fuera del sitio, y los filtros llevan directamente a las otras
 * páginas de género.
 *
 * Los géneros son una taxonomía cerrada, así que se prerenderizan los diecinueve
 * con `generateStaticParams` y cualquier otro slug cae en `notFound()` en vez de
 * consultar TMDB con un id inventado. (`dynamicParams = false` haría lo mismo en
 * el enrutado, pero `cacheComponents` no lo admite.)
 */

export function generateStaticParams() {
  return MOVIE_GENRES.map((genre) => ({ slug: genre.slug }));
}

export async function generateMetadata({ params }: PageProps<"/genres/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const genre = genreBySlug(slug);

  if (genre === undefined) return {};

  return {
    title: `Películas de ${genre.label}`,
    description: genre.description,
  };
}

export default function GenrePage({ params }: PageProps<"/genres/[slug]">) {
  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container className="flex flex-col gap-8 sm:gap-10">
        <Suspense
          fallback={
            <div className="flex flex-col gap-8 sm:gap-10">
              <GenreHeaderFallback />
              <GenreNavSkeleton />
              <BrowseResultsFallback />
            </div>
          }
        >
          <GenreContent params={params} />
        </Suspense>
      </Container>
    </main>
  );
}

async function GenreContent({ params }: { params: PageProps<"/genres/[slug]">["params"] }) {
  const { slug } = await params;
  const genre = genreBySlug(slug);

  // `dynamicParams = false` ya filtra los slugs desconocidos; esto es la
  // defensa para el día que la ruta cambie de estrategia de renderizado.
  if (genre === undefined) notFound();

  const outcome = await getBrowsePage({ genreId: genre.id, page: 1 });

  return (
    <>
      <header className="flex flex-col gap-3">
        <nav aria-label="Migas de pan" className="flex items-center gap-1 text-sm text-muted">
          <Link
            href="/explore"
            className="rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Explorar
          </Link>
          <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          <span aria-current="page" className="text-foreground">
            {genre.label}
          </span>
        </nav>

        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Películas de {genre.label}
        </h1>
        <p className="max-w-2xl text-pretty text-muted">{genre.description}</p>
      </header>

      <GenreNav currentSlug={genre.slug} />

      <BrowseResults outcome={outcome} genreSlug={genre.slug} />
    </>
  );
}
