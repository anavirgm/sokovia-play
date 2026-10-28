import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { getMovieDetails } from "@/lib/tmdb/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WatchPlayer } from "./watch-player";
import type { PlayerSource } from "@/components/player";
import { getDefaultMovieSources } from "@/lib/player/default-sources";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tmdb_id: string }>;
}): Promise<Metadata> {
  const { tmdb_id } = await params;
  const id = Number(tmdb_id);

  if (!Number.isInteger(id) || id <= 0) {
    return { title: "Ver película | VesperFlix" };
  }

  const result = await getMovieDetails(id);

  if (!result.ok) {
    return { title: "Ver película | VesperFlix" };
  }

  return {
    title: `Ver ${result.data.title} | VesperFlix`,
    description: `Reproduce ${result.data.title} en VesperFlix.`,
  };
}

async function WatchContent({ tmdbId }: { tmdbId: number }) {
  const [movieResult, supabase] = await Promise.all([
    getMovieDetails(tmdbId, ["videos"]),
    createSupabaseServerClient(),
  ]);

  if (!movieResult.ok) {
    notFound();
  }

  const movie = movieResult.data;

  // Buscar la película en nuestra DB por tmdb_id para obtener sus movie_sources
  const { data: dbMovie } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  let sources: PlayerSource[] = [];

  if (dbMovie?.id) {
    const { data } = await supabase
      .from("movie_sources")
      .select("id, name, type, url, quality, sort_order")
      .eq("movie_id", dbMovie.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      sources = data.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type as "youtube" | "embed",
        url: s.url,
        quality: s.quality,
        sort_order: s.sort_order,
      }));
    }
  }

  // Si no hay fuentes custom en BD, usar listado multiserver con opciones en español
  if (sources.length === 0) {
    sources = getDefaultMovieSources(tmdbId);
  }

  // Si por algún motivo no hay nada, caer al trailer de YouTube
  if (sources.length === 0 && movie.videos?.results?.length) {
    const trailer =
      movie.videos.results.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
      movie.videos.results.find((v) => v.site === "YouTube");
    if (trailer) {
      sources = [
        {
          id: "tmdb-trailer",
          name: "Tráiler (YouTube)",
          type: "youtube",
          url: `https://www.youtube.com/watch?v=${trailer.key}`,
        },
      ];
    }
  }

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface/60 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-surface">
          <svg
            className="size-8 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">Servidor no disponible</p>
          <p className="max-w-md text-pretty text-muted">
            No hay fuentes de reproducción activas para esta película en este momento. Vuelve más
            tarde o prueba con otro título.
          </p>
        </div>
        <Link
          href={`/movies/${movie.id}`}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
        >
          Volver a la ficha
        </Link>
      </div>
    );
  }

  return <WatchPlayer sources={sources} title={movie.title} tmdbId={tmdbId} />;
}

function WatchFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-video w-full animate-pulse rounded-xl border border-border bg-surface/60" />
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/60 p-2">
        <div className="h-8 w-16 animate-pulse rounded-lg bg-surface-hover" />
        <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-hover" />
        <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-hover" />
      </div>
    </div>
  );
}

export default async function WatchPage({ params }: { params: Promise<{ tmdb_id: string }> }) {
  const { tmdb_id } = await params;
  const id = Number(tmdb_id);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const movieResult = await getMovieDetails(id);
  if (!movieResult.ok) {
    notFound();
  }

  const movie = movieResult.data;

  return (
    <main className="flex flex-1 flex-col py-6 sm:py-8">
      <Container className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <Link
            href={`/movies/${movie.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver a la ficha
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{movie.title}</h1>
            <p className="text-muted">Reproducción</p>
          </div>
        </header>

        <Suspense fallback={<WatchFallback />}>
          <WatchContent tmdbId={id} />
        </Suspense>
      </Container>
    </main>
  );
}
