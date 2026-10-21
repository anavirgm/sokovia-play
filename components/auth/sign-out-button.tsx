"use client";

import { useTransition } from "react";

import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      void signOut();
    });
  }

  return (
    <Button variant="secondary" onClick={handleClick} disabled={pending}>
      {pending ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  );
}
