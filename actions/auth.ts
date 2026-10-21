"use server";
import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toAuthErrorMessage } from "@/features/auth/messages";
import { magicLinkSchema, signInSchema, signUpSchema } from "@/features/auth/validation";

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

function getBaseUrl(): string {
  // En desarrollo con `next dev` podemos inferirlo. En producción debe venir
  // configurado en las variables de entorno si se necesita.
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  // Fallback razonable: el redirect callback funcionará si Site URL está
  // configurado en el dashboard de Supabase. Para localhost es seguro.
  return "http://localhost:3000";
}

function sanitizeNextPath(raw: string | null): string {
  if (!raw) return "/account";
  // Solo rutas relativas para evitar open redirect
  if (!raw.startsWith("/")) return "/account";
  if (raw.startsWith("//")) return "/account";
  // Evitar loops hacia login
  if (raw.startsWith("/login")) return "/account";
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
 */
export async function signUpWithPassword(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signUpSchema.safeParse(raw);
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
  const baseUrl = getBaseUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    return { status: "error", message: toAuthErrorMessage(error) };
  }

  // Si hay sesión, el email ya está confirmado (autoconfirm habilitado)
  // o el proveedor no requiere confirmación. Redirigimos directamente.
  if (data.session) {
    const next = sanitizeNextPath(formData.get("next")?.toString() ?? null);
    redirect(next);
  }

  // Sin sesión: requiere confirmación por email.
  return {
    status: "success",
    needsEmailConfirmation: true,
    message:
      "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja de entrada (y la carpeta de spam).",
  };
}

/**
 * Enviar enlace mágico (OTP) al correo.
 */
export async function sendMagicLink(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get("email"),
  };

  const parsed = magicLinkSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: AuthState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (path === "email" && !fieldErrors.email) fieldErrors.email = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { email } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const baseUrl = getBaseUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback`,
      // shouldCreateUser: true por defecto (crea cuenta si no existe)
    },
  });

  if (error) {
    return { status: "error", message: toAuthErrorMessage(error) };
  }

  return {
    status: "success",
    message:
      "Te enviamos un enlace de acceso a tu correo. Ábrelo para entrar. Si no lo ves, revisa la carpeta de spam.",
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
