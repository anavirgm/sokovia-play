import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { getMovieDetails } from "@/lib/tmdb/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WatchPlayer } from "./watch-player";
import type { PlayerSource } from "@/components/player";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tmdb_id: string }>;
}): Promise<Metadata> {
  const { tmdb_id } = await params;
  const id = Number(tmdb_id);

  if (!Number.isInteger(id) || id <= 0) {
    return { title: "Ver película | SokoviaPlay" };
  }

  const result = await getMovieDetails(id);

  if (!result.ok) {
    return { title: "Ver película | SokoviaPlay" };
  }

  return {
    title: `Ver ${result.data.title} | SokoviaPlay`,
    description: `Reproduce ${result.data.title} en SokoviaPlay.`,
  };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ tmdb_id: string }>;
}) {
  const { tmdb_id } = await params;
  const id = Number(tmdb_id);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const [movieResult, supabase] = await Promise.all([
    getMovieDetails(id, ["videos"]),
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
    .eq("tmdb_id", id)
    .maybeSingle();

  let sources: PlayerSource[] = [];

  if (dbMovie?.id) {
    const { data } = await supabase
      .from("movie_sources")
      .select("id, name, type, url, quality, sort_order")
      .eq("movie_id", dbMovie.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (data) {
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

  // Si no hay fuentes embed/youtube en DB, usar trailer de YouTube como fallback
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

        {sources.length > 0 ? (
          <WatchPlayer sources={sources} title={movie.title} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface/60 py-16 text-center">
            <p className="text-lg font-medium">Sin servidor disponible</p>
            <p className="max-w-md text-pretty text-muted">
              No hay fuentes de reproducción activas para esta película. Vuelve más tarde o prueba otro título.
            </p>
            <Link
              href={`/movies/${movie.id}`}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
            >
              Ver ficha
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
}
