import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioCertificatesFromApi } from "../unilio/mapFromApi";
import { buildMockCertificates } from "../../config/unilio/apiMockData";

export function useUniLioCertificates() {
  const query = useQuery({
    queryKey: ["unilio", "certificates"],
    queryFn: async () => mapUniLioCertificatesFromApi(await api.get("/unilio/certificates")),
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioCertificatesFromApi(buildMockCertificates())
        : (query.data ?? mapUniLioCertificatesFromApi(buildMockCertificates())),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
