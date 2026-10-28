import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { MovieGrid } from "@/components/catalog/movie-grid";
import { MovieCard } from "@/components/catalog/movie-card";
import { getCurrentUser } from "@/features/auth/session";
import { getUserFavorites } from "@/actions/favorites";
import { Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/utils/cn";

export const metadata: Metadata = {
  title: "Mis favoritos | SokoviaPlay",
  description: "Lista de películas guardadas en favoritos.",
};

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/favorites");
  }

  const favorites = await getUserFavorites();

  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container className="flex flex-col gap-8 sm:gap-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-wide text-brand-soft uppercase">Mi lista</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Favoritos
          </h1>
          <p className="max-w-2xl text-pretty text-muted">
            {favorites.length === 0
              ? "Aún no has añadido ninguna película a favoritos."
              : `${favorites.length} ${favorites.length === 1 ? "película" : "películas"} guardadas.`}
          </p>
        </header>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface/60 py-16 text-center">
            <Heart className="size-12 text-muted" aria-hidden="true" />
            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium">Sin favoritos aún</p>
              <p className="max-w-md text-pretty text-muted">
                Explora el catálogo y añade películas a tus favoritos para tenerlas aquí.
              </p>
            </div>
            <Link href="/explore" className={cn(buttonVariants({ size: "lg" }), "mt-2")}>
              Explorar películas
            </Link>
          </div>
        ) : (
          <MovieGrid>
            {favorites.map((favorite) => {
              const movie = favorite.movie;
              if (!movie) return null;
              const cardMovie = {
                id: movie.tmdb_id,
                title: movie.title,
                poster_path: movie.poster_path,
                backdrop_path: movie.backdrop_path,
                vote_average: movie.vote_average,
                release_date: movie.release_date,
                overview: movie.overview,
                genre_ids: [] as number[],
              };
              return (
                <li key={favorite.id}>
                  <MovieCard
                    movie={cardMovie as unknown as Parameters<typeof MovieCard>[0]["movie"]}
                    href={`/movies/${movie.tmdb_id}`}
                  />
                </li>
              );
            })}
          </MovieGrid>
        )}
      </Container>
    </main>
  );
}
