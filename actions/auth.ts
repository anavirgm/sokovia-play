"use server";
import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toAuthErrorMessage } from "@/features/auth/messages";
import { signInSchema } from "@/features/auth/validation";

/**
 * Estado devuelto por las acciones de autenticación.
 * Los errores de campo se usan para pintar validación por input;
 * `message` es un error global con copia UX en español.
 */
export type AuthState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  /** Indica que el usuario debe confirmar su correo (signup sin autoconfirm). */
  needsEmailConfirmation?: boolean;
};

function sanitizeNextPath(raw: string | null): string {
  if (!raw) return "/admin";
  // Solo rutas relativas para evitar open redirect
  if (!raw.startsWith("/")) return "/admin";
  if (raw.startsWith("//")) return "/admin";
  // Evitar loops hacia login
  if (raw.startsWith("/login")) return "/admin";
  // Solo permitir /admin para el admin
  if (!raw.startsWith("/admin")) return "/admin";
  return raw;
}

/**
 * Iniciar sesión con email y contraseña.
 */
export async function signInWithPassword(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: AuthState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (path === "email" && !fieldErrors.email) fieldErrors.email = issue.message;
      if (path === "password" && !fieldErrors.password) fieldErrors.password = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Los errores de login se muestran como mensaje global (no revelan si
    // el email existe o no, para evitar enumeración de usuarios).
    return { status: "error", message: toAuthErrorMessage(error) };
  }

  const next = sanitizeNextPath(formData.get("next")?.toString() ?? null);
  redirect(next);
}

/**
 * Crear cuenta con email y contraseña.
 * Registro público deshabilitado: solo el administrador accede con usuario creado manualmente.
 */
export async function signUpWithPassword(
  _prevState: AuthState,
  _formData: FormData,
): Promise<AuthState> {
  return {
    status: "error",
    message: "El registro público está deshabilitado. Acceso solo para administrador.",
  };
}

/**
 * Enviar enlace mágico (OTP) al correo.
 * Deshabilitado: el acceso es solo con usuario creado manualmente desde el dashboard.
 */
export async function sendMagicLink(
  _prevState: AuthState,
  _formData: FormData,
): Promise<AuthState> {
  return {
    status: "error",
    message: "Los enlaces mágicos están deshabilitados. Usa email y contraseña.",
  };
}

/**
 * Cerrar sesión y redirigir al catálogo.
 */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
