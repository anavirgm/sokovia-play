"use client";

/**
 * Utilidades para gestionar el último servidor elegido por el usuario.
 * Se persiste en localStorage para mantener la preferencia entre navegaciones.
 */
const STORAGE_KEY = "vesperflix:player:last-source";

export function getLastSourceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLastSourceId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Ignorar errores de storage (modo incógnito, etc.)
  }
}
