import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Acceso administrador | VesperFlix",
  description: "Acceso al panel de administración de VesperFlix.",
};

type AuthMode = "signin" | "signup" | "magic";

function parseMode(raw: string | string[] | undefined): AuthMode {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "signup") return "signup";
  if (value === "magic") return "magic";
  return "signin";
}

function parseNext(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return "/admin";
  if (!value.startsWith("/")) return "/admin";
  if (value.startsWith("//")) return "/admin";
  if (value.startsWith("/login")) return "/admin";
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mode = parseMode(params.mode);
  const nextPath = parseNext(params.next);
  const callbackError = params.error === "auth_callback_failed";

  return (
    <main className="flex flex-1 flex-col justify-center py-10 sm:py-14">
      <Container>
        <LoginForm mode={mode} nextPath={nextPath} callbackError={callbackError} />
      </Container>
    </main>
  );
}
