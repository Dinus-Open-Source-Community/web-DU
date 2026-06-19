import { lazy, Suspense, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { registerProtectedFileCacheCleanup } from "@/lib/files/protected-file-cache-cleanup";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((module) => ({
        default: module.ReactQueryDevtools,
      })),
    )
  : null;

function QueryDevtoolsPanel() {
  if (!ReactQueryDevtools) return null;

  return (
    <Suspense fallback={null}>
      <ReactQueryDevtools initialIsOpen={false} />
    </Suspense>
  );
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000 * 5,
          gcTime: 60 * 1000 * 30,
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnMount: true,
        },
        mutations: {
          retry: 0,
        },
      },
    });

    registerProtectedFileCacheCleanup(client);
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <QueryDevtoolsPanel />
    </QueryClientProvider>
  );
}
