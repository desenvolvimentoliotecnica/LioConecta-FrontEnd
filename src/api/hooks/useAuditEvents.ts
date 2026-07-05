import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  AuditEventQueryParams,
  AuditEventSummaryDto,
  PagedAuditEventsDto,
} from "../types";

export const AUDIT_EVENTS_QUERY_KEY = ["admin", "audit-events"] as const;

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

export function useAuditEvents(params: AuditEventQueryParams) {
  return useQuery({
    queryKey: [...AUDIT_EVENTS_QUERY_KEY, "list", params],
    queryFn: () =>
      api.get<PagedAuditEventsDto>(
        `/admin/audit-events${buildQueryString({
          action: params.action,
          actorId: params.actorId,
          targetType: params.targetType,
          correlationId: params.correlationId,
          source: params.source,
          from: params.from,
          to: params.to,
          httpStatus: params.httpStatus,
          page: params.page,
          pageSize: params.pageSize,
        })}`,
      ),
    enabled: !config.useMock,
  });
}

export function useAuditSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: [...AUDIT_EVENTS_QUERY_KEY, "summary", from, to],
    queryFn: () =>
      api.get<AuditEventSummaryDto>(
        `/admin/audit-events/summary${buildQueryString({ from, to })}`,
      ),
    enabled: !config.useMock,
  });
}

export function useAuditActions(from?: string, to?: string) {
  return useQuery({
    queryKey: [...AUDIT_EVENTS_QUERY_KEY, "actions", from, to],
    queryFn: () =>
      api.get<string[]>(
        `/admin/audit-events/actions${buildQueryString({ from, to, limit: 100 })}`,
      ),
    enabled: !config.useMock,
  });
}

export function useAuditTargetTypes(from?: string, to?: string) {
  return useQuery({
    queryKey: [...AUDIT_EVENTS_QUERY_KEY, "target-types", from, to],
    queryFn: () =>
      api.get<string[]>(
        `/admin/audit-events/target-types${buildQueryString({ from, to, limit: 50 })}`,
      ),
    enabled: !config.useMock,
  });
}
