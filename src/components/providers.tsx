"use client";

import { SessionProvider } from "next-auth/react";
import { AuthSync } from "@/components/auth-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <AuthSync />
      {children}
    </SessionProvider>
  );
}
