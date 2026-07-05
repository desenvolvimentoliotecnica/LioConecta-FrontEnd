import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  ObservabilitySummaryDto,
  ObservabilityMetricsDto,
  ObservabilityTimelineDto,
  PagedAccessEventsDto,
  PagedObservabilityEventsDto,
  PagedPageViewsDto,
} from "../types";

export const OBSERVABILITY_QUERY_KEY = ["admin", "observability"] as const;

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function useObservabilitySummary(from?: string, to?: string) {
  return useQuery({
    queryKey: [...OBSERVABILITY_QUERY_KEY, "summary", from, to],
    queryFn: () =>
      api.get<ObservabilitySummaryDto>(
        `/admin/observability/summary${buildQueryString({ from, to })}`,
      ),
    enabled: !config.useMock,
  });
}

export function useObservabilityErrors(params: {
  from?: string;
  to?: string;
  eventName?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: [...OBSERVABILITY_QUERY_KEY, "errors", params],
    queryFn: () =>
      api.get<PagedObservabilityEventsDto>(
        `/admin/observability/errors${buildQueryString({
          from: params.from,
          to: params.to,
          eventName: params.eventName,
          page: params.page,
          pageSize: params.pageSize,
        })}`,
      ),
    enabled: !config.useMock,
  });
}

export function useObservabilityPageViews(params: {
  from?: string;
  to?: string;
  module?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: [...OBSERVABILITY_QUERY_KEY, "page-views", params],
    queryFn: () =>
      api.get<PagedPageViewsDto>(
        `/admin/observability/page-views${buildQueryString({
          from: params.from,
          to: params.to,
          module: params.module,
          page: params.page,
          pageSize: params.pageSize,
        })}`,
      ),
    enabled: !config.useMock,
  });
}

export function useObservabilityAccessEvents(params: {
  from?: string;
  to?: string;
  result?: string;
  eventName?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: [...OBSERVABILITY_QUERY_KEY, "access-events", params],
    queryFn: () =>
      api.get<PagedAccessEventsDto>(
        `/admin/observability/access-events${buildQueryString({
          from: params.from,
          to: params.to,
          result: params.result,
          eventName: params.eventName,
          page: params.page,
          pageSize: params.pageSize,
        })}`,
      ),
    enabled: !config.useMock,
  });
}

export function useObservabilityMetrics(from?: string, to?: string, period?: string) {
  return useQuery({
    queryKey: [...OBSERVABILITY_QUERY_KEY, "metrics", from, to, period],
    queryFn: () =>
      api.get<ObservabilityMetricsDto>(
        `/admin/observability/metrics${buildQueryString({ from, to, period })}`,
      ),
    enabled: !config.useMock,
  });
}

export function useObservabilityInvestigate(correlationId?: string) {
  return useQuery({
    queryKey: [...OBSERVABILITY_QUERY_KEY, "investigate", correlationId],
    queryFn: () =>
      api.get<ObservabilityTimelineDto>(
        `/admin/observability/investigate${buildQueryString({ correlationId })}`,
      ),
    enabled: !config.useMock && Boolean(correlationId),
  });
}
