"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@saphara/wallet";
import { AuthProvider } from "../features/auth/AuthContext";
import { useState, type ReactNode } from "react";

/** Cuzdan + veri sorgu + oturum saglayicilari. */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:          30_000,
        gcTime:             5 * 60_000,
        retry:              1,
        refetchOnWindowFocus: false,
      },
    },
  }));
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
