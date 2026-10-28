"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMovieDetails } from "@/lib/tmdb/queries";

type SaveProgressInput = {
  tmdbId: number;
  lastPositionSeconds: number;
  durationSeconds: number;
};

/**
 * Guarda o actualiza el progreso de visualización.
 * Usa upsert en watch_history con unicidad (user_id, movie_id).
 */
export async function saveWatchProgress({
  tmdbId,
  lastPositionSeconds,
  durationSeconds,
}: SaveProgressInput) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, reason: "not-authenticated" };
  }

  if (lastPositionSeconds < 0 || durationSeconds < 0) {
    return { success: false, reason: "invalid-values" };
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
      return { success: false, reason: "movie-not-found" };
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
      return { success: false, reason: "insert-failed" };
    }

    movieId = insertedMovie.id;
  }

  // Upsert en watch_history
  const { error: upsertError } = await supabase.from("watch_history").upsert(
    {
      user_id: user.id,
      movie_id: movieId,
      last_position_seconds: Math.floor(lastPositionSeconds),
      duration_seconds: Math.floor(durationSeconds),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,movie_id",
    },
  );

  if (upsertError) {
    return { success: false, reason: "upsert-failed" };
  }

  revalidatePath("/");
  revalidatePath("/watch");
  revalidatePath(`/watch/${tmdbId}`);

  return { success: true };
}

/**
 * Obtiene el historial de visualización del usuario actual
 */
export async function getWatchHistory() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("watch_history")
    .select(
      `
      id,
      last_position_seconds,
      duration_seconds,
      updated_at,
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
    .order("updated_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

/**
 * Obtiene el progreso de una película específica
 */
export async function getMovieProgress(tmdbId: number) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const { data: movie } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  if (!movie) {
    return null;
  }

  const { data } = await supabase
    .from("watch_history")
    .select("last_position_seconds, duration_seconds, updated_at")
    .eq("user_id", user.id)
    .eq("movie_id", movie.id)
    .maybeSingle();

  return data;
}

/**
 * Elimina una entrada del historial
 */
export async function removeFromHistory(tmdbId: number) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false };
  }

  const supabase = await createSupabaseServerClient();

  const { data: movie } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  if (!movie) {
    return { success: false };
  }

  const { error } = await supabase
    .from("watch_history")
    .delete()
    .eq("user_id", user.id)
    .eq("movie_id", movie.id);

  if (error) {
    return { success: false };
  }

  revalidatePath("/");

  return { success: true };
}
