import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, //30 seconds
      gcTime: 5 * 60_000, //5 minutes
      refetchOnWindowFocus: false,
      retry: (n, error) =>
        error?.status >= 400 && error?.status < 500 ? false : n < 2,
    },
    mutations: { retry: false },
  },
});
