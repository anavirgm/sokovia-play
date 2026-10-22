"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";

import { sendMagicLink, signInWithPassword, signUpWithPassword } from "@/actions/auth";
import type { AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/utils/cn";

/**
 * Formulario de autenticación con tres modos: iniciar sesión, crear cuenta,
 * enlace mágico.
 *
 * El modo se gestiona con URL search params (server-friendly, deep-linkable).
 * Las acciones usan `useActionState` (React 19) con validación en servidor.
 */
type AuthMode = "signin" | "signup" | "magic";

const INITIAL_STATE: AuthState = { status: "idle" };

const MODE_META: Record<AuthMode, { title: string; subtitle: string }> = {
  signin: {
    title: "Iniciar sesión",
    subtitle: "Accede con tu correo y contraseña para continuar.",
  },
  signup: {
    title: "Crear cuenta",
    subtitle: "Regístrate para guardar tus preferencias y listas.",
  },
  magic: {
    title: "Entrar con un enlace",
    subtitle: "Te enviamos un enlace al correo para iniciar sesión sin contraseña.",
  },
};

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-[background-color,color] duration-200",
        active
          ? "bg-surface text-foreground"
          : "text-muted hover:bg-surface-hover/60 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-danger" role="alert">
      {message}
    </p>
  );
}

export function LoginForm({
  mode,
  nextPath,
  callbackError,
}: {
  mode: AuthMode;
  nextPath: string;
  callbackError?: boolean;
}) {
  const [signInState, signInAction, signInPending] = useActionState(
    signInWithPassword,
    INITIAL_STATE,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUpWithPassword,
    INITIAL_STATE,
  );
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, INITIAL_STATE);

  // Estado para el formulario de contraseña con toggle visual (mejora UX)
  const [showPassword, setShowPassword] = useState(false);

  const meta = MODE_META[mode];

  // Determinar qué estado mostrar
  const activeState =
    mode === "signin" ? signInState : mode === "signup" ? signUpState : magicState;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface/80 p-6 shadow-[0_40px_120px_-80px_rgba(59,130,246,0.4)] backdrop-blur sm:p-8">
        <header className="flex flex-col gap-2 text-center">
          <p className="text-sm font-medium tracking-wide text-brand-soft uppercase">Acceso</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{meta.title}</h1>
          <p className="text-pretty text-muted">{meta.subtitle}</p>
        </header>

        {callbackError && (
          <Notice
            icon={<TriangleAlert className="size-6" aria-hidden="true" />}
            title="No pudimos completar la entrada"
            description="El enlace ha caducado o es inválido. Solicita un nuevo enlace o inicia sesión con contraseña."
          />
        )}

        {mode !== "magic" && (
          <nav
            className="grid grid-cols-1 gap-1 rounded-lg border border-border bg-background/60 p-1"
            aria-label="Modo de autenticación"
          >
            <TabLink
              href={`/login?next=${encodeURIComponent(nextPath)}`}
              active={mode === "signin"}
            >
              Acceso administrador
            </TabLink>
          </nav>
        )}

        {/* Mensaje de error global */}
        {activeState.status === "error" && activeState.message && (
          <Notice
            icon={<TriangleAlert className="size-6" aria-hidden="true" />}
            title="Ha ocurrido un error"
            description={activeState.message}
          />
        )}

        {/* Éxito: confirmación por email */}
        {mode === "signup" &&
          signUpState.status === "success" &&
          signUpState.needsEmailConfirmation && (
            <Notice
              icon={<Info className="size-6" aria-hidden="true" />}
              title="Confirma tu correo"
              description={signUpState.message}
            />
          )}

        {/* Éxito: enlace mágico enviado */}
        {mode === "magic" && magicState.status === "success" && (
          <Notice
            icon={<CircleCheck className="size-6" aria-hidden="true" />}
            title="Enlace enviado"
            description={magicState.message}
          />
        )}

        {/* Formulario: inicio de sesión */}
        {mode === "signin" && !(signInState.status === "success") && (
          <form action={signInAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={nextPath} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signin-email" className="text-sm font-medium">
                Correo electrónico
              </label>
              <Input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                aria-invalid={signInState.fieldErrors?.email ? "true" : undefined}
              />
              <FieldError message={signInState.fieldErrors?.email} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signin-password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="signin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                aria-invalid={signInState.fieldErrors?.password ? "true" : undefined}
              />
              <FieldError message={signInState.fieldErrors?.password} />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="self-start text-sm text-muted hover:text-foreground"
              >
                {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              </button>
            </div>
            <Button type="submit" size="lg" disabled={signInPending}>
              {signInPending ? "Entrando..." : "Iniciar sesión"}
            </Button>
          </form>
        )}

        {/* Formulario: registro */}
        {mode === "signup" &&
          !(signUpState.status === "success" && signUpState.needsEmailConfirmation) && (
            <form action={signUpAction} className="flex flex-col gap-4">
              <input type="hidden" name="next" value={nextPath} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-email" className="text-sm font-medium">
                  Correo electrónico
                </label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  aria-invalid={signUpState.fieldErrors?.email ? "true" : undefined}
                />
                <FieldError message={signUpState.fieldErrors?.email} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-password" className="text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  aria-invalid={signUpState.fieldErrors?.password ? "true" : undefined}
                />
                <FieldError message={signUpState.fieldErrors?.password} />
                <p className="text-xs text-muted">Mínimo 8 caracteres.</p>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="self-start text-sm text-muted hover:text-foreground"
                >
                  {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                </button>
              </div>
              <Button type="submit" size="lg" disabled={signUpPending}>
                {signUpPending ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>
          )}

        {/* Formulario: enlace mágico */}
        {mode === "magic" && magicState.status !== "success" && (
          <form action={magicAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={nextPath} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="magic-email" className="text-sm font-medium">
                Correo electrónico
              </label>
              <Input
                id="magic-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                aria-invalid={magicState.fieldErrors?.email ? "true" : undefined}
              />
              <FieldError message={magicState.fieldErrors?.email} />
            </div>
            <Button type="submit" size="lg" disabled={magicPending}>
              {magicPending ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>
        )}

        {/* Navegación entre modos */}
        <footer className="flex flex-col items-center gap-2 text-center text-sm text-muted">
          {mode === "magic" && (
            <p>
              <Link
                href={`/login?next=${encodeURIComponent(nextPath)}`}
                className="font-medium text-brand-soft hover:text-foreground"
              >
                Iniciar sesión con contraseña
              </Link>
            </p>
          )}
          <p className="pt-2">
            <Link href="/" className="hover:text-foreground">
              Volver al catálogo
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
