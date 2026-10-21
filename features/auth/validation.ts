import { z } from "zod";

/**
 * Esquemas de validación para el flujo de autenticación.
 *
 * La validación en cliente mejora la UX, pero la fuente de verdad es el
 * servidor: Server Actions vuelven a validar con estos mismos esquemas.
 */

/** Esquema para iniciar sesión con email y contraseña. */
export const signInSchema = z.object({
  email: z
    .string({ message: "El correo es obligatorio." })
    .trim()
    .min(1, "El correo es obligatorio.")
    .pipe(z.email("Introduce un correo válido.")),
  password: z
    .string({ message: "La contraseña es obligatoria." })
    .min(1, "La contraseña es obligatoria."),
});

/** Esquema para crear una cuenta con email y contraseña. */
export const signUpSchema = z.object({
  email: z
    .string({ message: "El correo es obligatorio." })
    .trim()
    .min(1, "El correo es obligatorio.")
    .pipe(z.email("Introduce un correo válido.")),
  password: z
    .string({ message: "La contraseña es obligatoria." })
    .min(8, "La contraseña necesita al menos 8 caracteres."),
});

/** Esquema para enviar un enlace mágico. */
export const magicLinkSchema = z.object({
  email: z
    .string({ message: "El correo es obligatorio." })
    .trim()
    .min(1, "El correo es obligatorio.")
    .pipe(z.email("Introduce un correo válido.")),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
