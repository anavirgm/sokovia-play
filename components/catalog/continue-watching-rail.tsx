import { MovieCard } from "@/components/catalog/movie-card";
import { MovieSlider } from "@/components/catalog/movie-slider";
import { getWatchHistory } from "@/actions/watch-history";

export async function ContinueWatchingRail() {
  const history = await getWatchHistory();

  if (history.length === 0) {
    return null;
  }

  const movies = history
    .filter((item) => item.movie)
    .map((item) => {
      const movie = item.movie as Record<string, unknown>;
      const progress =
        item.duration_seconds > 0
          ? Math.round((item.last_position_seconds / item.duration_seconds) * 100)
          : 0;

      return {
        id: movie.tmdb_id as number,
        title: movie.title as string,
        poster_path: movie.poster_path as string | null,
        backdrop_path: movie.backdrop_path as string | null,
        vote_average: movie.vote_average as number,
        release_date: movie.release_date as string | null,
        overview: movie.overview as string | null,
        genre_ids: [] as number[],
        progress,
        lastPosition: item.last_position_seconds,
      };
    });

  if (movies.length === 0) {
    return null;
  }

  return (
    <MovieSlider heading="Continuar viendo">
      {movies.map((movie) => (
        <div key={movie.id} className="relative">
          <MovieCard
            movie={movie as unknown as Parameters<typeof MovieCard>[0]["movie"]}
            href={`/watch/${movie.id}`}
          />
          {movie.progress > 0 && movie.progress < 95 && (
            <div className="absolute right-0 bottom-0 left-0 h-1 bg-surface/60">
              <div
                className="h-full bg-brand"
                style={{ width: `${Math.min(movie.progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </MovieSlider>
  );
}
