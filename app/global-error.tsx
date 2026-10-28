"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { logError } from "@/lib/errors/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, { scope: "global-error" });
  }, [error]);

  return (
    <html lang="es">
      <body>
        <main
          style={{
            display: "flex",
            minHeight: "100dvh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            backgroundColor: "#09090b",
            color: "#fafafa",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              maxWidth: "28rem",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              textAlign: "center",
            }}
            role="alert"
          >
            <div
              style={{
                display: "flex",
                height: "4rem",
                width: "4rem",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              }}
            >
              <TriangleAlert style={{ height: "2rem", width: "2rem", color: "#f87171" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h1 style={{ fontSize: "1.875rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
                Error crítico
              </h1>
              <p style={{ color: "#a1a1aa" }}>
                Ha ocurrido un error inesperado. Por favor, recarga la página o vuelve más tarde.
              </p>
            </div>
            <div
              style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}
            >
              <button
                onClick={reset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.75rem",
                  backgroundColor: "#6366f1",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Reintentar
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.75rem",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#fafafa",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                }}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
