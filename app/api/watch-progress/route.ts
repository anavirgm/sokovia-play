import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMovieDetails } from "@/lib/tmdb/queries";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await request.json();
    const { tmdbId, lastPositionSeconds, durationSeconds } = body;

    if (!tmdbId || lastPositionSeconds < 0 || durationSeconds < 0) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Asegurarnos de que la película existe
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
        return NextResponse.json({ success: false }, { status: 404 });
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
        return NextResponse.json({ success: false }, { status: 500 });
      }

      movieId = insertedMovie.id;
    }

    await supabase.from("watch_history").upsert(
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in watch-progress API:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
