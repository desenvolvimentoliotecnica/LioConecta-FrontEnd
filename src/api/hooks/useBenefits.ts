import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  BenefitDetailDto,
  BenefitListItemDto,
  BenefitRequestResultDto,
  BenefitSummaryDto,
  CreateBenefitRequestDto,
} from "../types";

export const BENEFITS_QUERY_KEY = ["benefits"] as const;

export function useBenefitSummary() {
  return useQuery({
    queryKey: [...BENEFITS_QUERY_KEY, "summary"],
    queryFn: () => api.get<BenefitSummaryDto>("/rh/benefits/summary"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useBenefitList() {
  return useQuery({
    queryKey: [...BENEFITS_QUERY_KEY, "list"],
    queryFn: () => api.get<BenefitListItemDto[]>("/rh/benefits"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useBenefitDetail(benefitId: string | null) {
  return useQuery({
    queryKey: [...BENEFITS_QUERY_KEY, "detail", benefitId],
    queryFn: () => api.get<BenefitDetailDto>(`/rh/benefits/${benefitId}`),
    enabled: benefitId !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function useBenefitRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBenefitRequestDto) =>
      api.post<BenefitRequestResultDto>("/rh/benefits/requests", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEY });
    },
  });
}
