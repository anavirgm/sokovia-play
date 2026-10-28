type ErrorContext = Record<string, unknown>;

function sanitizeContext(ctx: ErrorContext = {}): ErrorContext {
  const sanitized: ErrorContext = {};
  for (const [key, value] of Object.entries(ctx)) {
    if (/(email|password|token|secret|key|phone|address|credential)/i.test(key)) {
      continue;
    }
    if (typeof value === "string" && value.length > 200) {
      sanitized[key] = `${value.slice(0, 200)}...`;
      continue;
    }
    if (typeof value === "object" && value !== null) {
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
}

export function logError(error: unknown, context: ErrorContext = {}) {
  const safeContext = sanitizeContext(context);

  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", error, safeContext);
    return;
  }

  if (error instanceof Error) {
    console.error("[Error]", {
      name: error.name,
      message: error.message,
      digest: (error as Error & { digest?: string }).digest,
      ...safeContext,
    });
    return;
  }

  console.error("[Error]", {
    message: String(error),
    ...safeContext,
  });
}

export function mapError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.";
  }

  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid_grant")) {
    return "Correo o contraseña incorrectos.";
  }
  if (msg.includes("email not confirmed")) {
    return "Debes confirmar tu correo electrónico para iniciar sesión.";
  }
  if (msg.includes("user already registered") || msg.includes("already exists")) {
    return "Ya existe una cuenta con este correo electrónico.";
  }
  if (msg.includes("auth") || msg.includes("unauthorized") || msg.includes("jwt")) {
    return "Sesión no válida. Por favor, inicia sesión de nuevo.";
  }

  if (msg.includes("duplicate key") || msg.includes("unique constraint")) {
    return "Ya existe un registro con estos datos.";
  }
  if (msg.includes("foreign key") || msg.includes("violates foreign key")) {
    return "No se puede completar la operación por restricciones de datos.";
  }
  if (
    msg.includes("row level security") ||
    msg.includes("rls") ||
    msg.includes("permission denied")
  ) {
    return "No tienes permisos para realizar esta acción.";
  }

  if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch")) {
    return "Error de conexión. Comprueba tu conexión a internet.";
  }
  if (msg.includes("timeout")) {
    return "La solicitud ha tardado demasiado. Inténtalo de nuevo.";
  }

  return "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.";
}
