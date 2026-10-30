import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { getMovieDetails } from "@/lib/tmdb/queries";
import { tmdbImageUrl } from "@/lib/tmdb/image";
import { cn } from "@/utils/cn";
import type { TmdbMovieDetails, TmdbVideo } from "@/types/tmdb";

export const instant = false;

/**
 * Ficha de película (detalle).
 *
 * SSR con datos de TMDB (cacheados con `cacheLife`). Muestra poster/backdrop,
 * sinopsis, géneros, rating, año, duración. CTA "Ver película" hacia /watch/[tmdb_id]
 * (se implementará en #20, pero el enlace queda preparado).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tmdb_id: string }>;
}): Promise<Metadata> {
  const { tmdb_id } = await params;
  const id = Number(tmdb_id);

  if (!Number.isInteger(id) || id <= 0) {
    return { title: "Película no encontrada | VesperFlix" };
  }

  const result = await getMovieDetails(id);

  if (!result.ok) {
    return { title: "Película no encontrada | VesperFlix" };
  }

  const movie = result.data;
  const description = movie.overview?.trim() || undefined;

  return {
    title: `${movie.title} | VesperFlix`,
    description,
    openGraph: {
      title: movie.title,
      description,
      images: movie.backdrop_path
        ? [`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`]
        : undefined,
    },
  };
}

function getTrailer(videos?: { results: TmdbVideo[] }) {
  if (!videos?.results?.length) return null;
  const results = videos.results;
  // Prefer official trailer in Spanish, else any trailer, else teaser
  const officialEs = results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer" && v.official && v.iso_639_1 === "es",
  );
  if (officialEs) return officialEs;
  const trailerEs = results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer" && v.iso_639_1 === "es",
  );
  if (trailerEs) return trailerEs;
  const official = results.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official);
  if (official) return official;
  const trailer = results.find((v) => v.site === "YouTube" && v.type === "Trailer");
  if (trailer) return trailer;
  const teaser = results.find((v) => v.site === "YouTube" && v.type === "Teaser");
  return teaser ?? null;
}

function formatRuntime(minutes: number | null) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ tmdb_id: string }>;
}) {
  const { tmdb_id } = await params;
  const id = Number(tmdb_id);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const result = await getMovieDetails(id, ["videos"]);

  if (!result.ok) {
    notFound();
  }

  const movie: TmdbMovieDetails = result.data;
  const backdrop = tmdbImageUrl(movie.backdrop_path, "w1280");
  const poster = tmdbImageUrl(movie.poster_path, "w500");
  const trailer = getTrailer(movie.videos);
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const runtime = formatRuntime(movie.runtime);
  const vote = movie.vote_count > 0 ? movie.vote_average.toFixed(1) : null;

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero con backdrop */}
      <section className="relative">
        {backdrop && (
          <div className="absolute inset-0">
            <img
              src={backdrop}
              alt=""
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>
        )}
        <Container className="relative flex flex-col gap-8 py-10 sm:py-14 lg:flex-row lg:gap-10">
          {/* Poster */}
          <div className="mx-auto w-full max-w-[280px] shrink-0 sm:max-w-[320px] lg:mx-0">
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-elevated">
              {poster ? (
                <img
                  src={poster}
                  alt={`Póster de ${movie.title}`}
                  width={500}
                  height={750}
                  className="aspect-[2/3] w-full object-cover"
                />
              ) : (
                <div className="grid aspect-[2/3] w-full place-items-center p-6">
                  <span className="text-center text-sm text-muted">{movie.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-6">
            <header className="flex flex-col gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-lg text-pretty text-muted italic">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                {year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4" aria-hidden="true" />
                    {year}
                  </span>
                )}
                {runtime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" aria-hidden="true" />
                    {runtime}
                  </span>
                )}
                {vote && (
                  <span className="flex items-center gap-1.5">
                    <Star className="size-4 fill-brand-soft text-brand-soft" aria-hidden="true" />
                    {vote} / 10
                    <span className="text-muted/70">
                      ({movie.vote_count.toLocaleString("es-ES")})
                    </span>
                  </span>
                )}
              </div>
              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full border border-border px-3 py-1 text-sm text-muted"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {movie.overview && (
              <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold tracking-tight">Sinopsis</h2>
                <p className="max-w-3xl leading-relaxed text-pretty text-muted">{movie.overview}</p>
              </section>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/watch/${movie.id}`} className={cn(buttonVariants({ size: "lg" }))}>
                Ver película
              </Link>
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
                >
                  Ver tráiler
                </a>
              )}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
