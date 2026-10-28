"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMovieDetails } from "@/lib/tmdb/queries";

/**
 * Añade o quita una película de favoritos.
 * Garantiza unicidad vía constraint (user_id, movie_id).
 */
export async function toggleFavorite(tmdbId: number) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=/movies/${tmdbId}`);
  }

  const supabase = await createSupabaseServerClient();

  // Asegurarnos de que la película existe en nuestra tabla movies
  const { data: existingMovie } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  let movieId: string;

  if (existingMovie?.id) {
    movieId = existingMovie.id;
  } else {
    const result = await getMovieDetails(tmdbId);

    if (!result.ok) {
      throw new Error("No se pudo obtener la película");
    }

    const movie = result.data;

    const { data: insertedMovie, error: insertError } = await supabase
      .from("movies")
      .insert({
        tmdb_id: movie.id,
        title: movie.title,
        overview: movie.overview ?? null,
        poster_path: movie.poster_path ?? null,
        backdrop_path: movie.backdrop_path ?? null,
        release_date: movie.release_date ?? null,
        vote_average: movie.vote_average ?? 0,
      })
      .select("id")
      .single();

    if (insertError || !insertedMovie) {
      throw new Error("No se pudo guardar la película");
    }

    movieId = insertedMovie.id;
  }

  // Comprobar si ya es favorito
  const { data: existingFavorite } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("movie_id", movieId)
    .maybeSingle();

  if (existingFavorite) {
    const { error: deleteError } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existingFavorite.id);

    if (deleteError) {
      throw new Error("No se pudo quitar de favoritos");
    }
  } else {
    const { error: insertFavoriteError } = await supabase.from("favorites").insert({
      user_id: user.id,
      movie_id: movieId,
    });

    if (insertFavoriteError) {
      throw new Error("No se pudo añadir a favoritos");
    }
  }

  revalidatePath(`/movies/${tmdbId}`);
  revalidatePath("/favorites");
  revalidatePath("/");
}

/**
 * Obtiene los favoritos del usuario actual
 */
export async function getUserFavorites() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("favorites")
    .select(
      `
      id,
      created_at,
      movie:movies(
        id,
        tmdb_id,
        title,
        poster_path,
        backdrop_path,
        release_date,
        vote_average,
        overview
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

/**
 * Comprueba si una película es favorita del usuario actual
 */
export async function isFavorite(tmdbId: number): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const supabase = await createSupabaseServerClient();

  const { data: movie } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  if (!movie) {
    return false;
  }

  const { data: favorite } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("movie_id", movie.id)
    .maybeSingle();

  return !!favorite;
}
