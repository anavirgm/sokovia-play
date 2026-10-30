import type { NextConfig } from "next";

/**
 * Configuración de Next.js 16 (Turbopack por defecto).
 *
 * - `cacheComponents`: habilita el modelo de caché explícito de Next 16
 *   (las rutas son dinámicas salvo que usen `"use cache"`).
 * - `partialPrefetching`: precarga parcial de rutas para navegación instantánea.
 * - `turbopack.rules`: Tailwind CSS v4 se procesa mediante su loader nativo.
 */
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://image.tmdb.org https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://api.themoviedb.org https://*.supabase.co wss://*.supabase.co",
      "media-src 'self' blob:",
      "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://vidsrc.to https://www.2embed.cc",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ];

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
