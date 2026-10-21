/**
 * Traduce los errores de Supabase Auth a mensajes UX en español.
 *
 * Los códigos/mensajes de Supabase cambian entre versiones; este mapper cubre
 * los casos habituales y recurre a un mensaje genérico si no hay traducción.
 */

export type AuthErrorKey =
  | "invalid_credentials"
  | "user_already_exists"
  | "email_not_confirmed"
  | "weak_password"
  | "rate_limited"
  | "email_exists"
  | "same_password"
  | "network"
  | "unknown";

/**
 * Mensaje genérico de recuperación para el usuario.
 * Nunca se expone `error.message` crudo al usuario (podría filtrar detalles del
 * backend). En desarrollo puede loguearse en consola desde la acción.
 */
const DEFAULT_ERROR = "No pudimos completar la operación. Inténtalo de nuevo.";

/**
 * Mapeo de códigos/mensajes de error de Supabase a mensajes en español.
 */
const ERROR_MAP: Record<string, string> = {
  // Credenciales inválidas
  invalid_credentials: "Ese correo o esa contraseña no coinciden.",
  invalid_grant: "Ese correo o esa contraseña no coinciden.",

  // Registro
  user_already_exists: "Ya existe una cuenta con ese correo. Inicia sesión.",
  email_exists: "Ya existe una cuenta con ese correo. Inicia sesión.",
  "User already registered": "Ya existe una cuenta con ese correo. Inicia sesión.",

  // Confirmación de email
  email_not_confirmed:
    "Confirma tu correo antes de entrar. Revisa tu bandeja de entrada (y la carpeta de spam).",

  // Contraseña
  weak_password: "La contraseña necesita al menos 8 caracteres.",
  "Password should be at least 6 characters": "La contraseña necesita al menos 8 caracteres.",
  same_password: "La nueva contraseña debe ser distinta de la actual.",

  // Rate limiting
  over_request_rate_limit: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  "Too many requests": "Demasiados intentos. Espera un momento e inténtalo de nuevo.",

  // Red/otros
  network: "No pudimos contactar con el servidor. Revisa tu conexión.",
  "Failed to fetch": "No pudimos contactar con el servidor. Revisa tu conexión.",

  // Magic link / OTP
  otp_expired: "El enlace ha caducado. Solicita uno nuevo.",
  "Email link is invalid or has expired": "El enlace ha caducado. Solicita uno nuevo.",
  "Token has expired or is invalid": "El enlace ha caducado. Solicita uno nuevo.",
};

/**
 * Convierte un error de Supabase Auth en un mensaje UX en español.
 */
export function toAuthErrorMessage(error: unknown): string {
  if (!error) {
    return DEFAULT_ERROR;
  }

  // Error con código
  if (typeof error === "object") {
    const err = error as Record<string, unknown>;
    const code = typeof err.code === "string" ? err.code : undefined;
    const status = typeof err.status === "number" ? err.status : undefined;
    const message = typeof err.message === "string" ? err.message : undefined;

    // Por código primero
    if (code && ERROR_MAP[code]) {
      return ERROR_MAP[code];
    }

    // Por mensaje exacto o parcial
    if (message) {
      // Mapeo directo
      if (ERROR_MAP[message]) {
        return ERROR_MAP[message];
      }

      // Mapeo por contenido parcial
      const lower = message.toLowerCase();
      if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
        return "Ese correo o esa contraseña no coinciden.";
      }
      if (lower.includes("already registered") || lower.includes("user already")) {
        return "Ya existe una cuenta con ese correo. Inicia sesión.";
      }
      if (lower.includes("email not confirmed") || lower.includes("confirm your email")) {
        return "Confirma tu correo antes de entrar. Revisa tu bandeja de entrada (y la carpeta de spam).";
      }
      if (lower.includes("password") && lower.includes("at least")) {
        return "La contraseña necesita al menos 8 caracteres.";
      }
      if (lower.includes("rate") || lower.includes("too many")) {
        return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
      }
      if (lower.includes("expired") || (lower.includes("invalid") && lower.includes("token"))) {
        return "El enlace ha caducado. Solicita uno nuevo.";
      }
      if (lower.includes("fetch") || lower.includes("network")) {
        return "No pudimos contactar con el servidor. Revisa tu conexión.";
      }
    }

    // Por status
    if (status === 429) {
      return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
    }
  }

  return DEFAULT_ERROR;
}
