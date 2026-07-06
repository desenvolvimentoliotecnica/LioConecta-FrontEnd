import { useQuery } from "@tanstack/react-query";

export type ApiHealthStatus = "checking" | "online" | "offline";

async function fetchApiHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("/health", {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    return response.ok;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function useApiHealth() {
  const query = useQuery({
    queryKey: ["api-health"],
    queryFn: fetchApiHealth,
    refetchInterval: 10_000,
    retry: 1,
    staleTime: 5_000,
  });

  const status: ApiHealthStatus = query.isLoading || query.isFetching
    ? "checking"
    : query.data
      ? "online"
      : "offline";

  return {
    status,
    isChecking: status === "checking",
    isOnline: status === "online",
    isOffline: status === "offline",
    refetch: query.refetch,
  };
}
