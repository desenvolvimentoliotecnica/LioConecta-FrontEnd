import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  CreatePayslipRequestDto,
  DescontosConsultaDto,
  FgtsConsultaDto,
  IncomeStatementDto,
  PayslipComparativoDto,
  PayslipDetailDto,
  PayslipListItemDto,
  PayslipRequestResultDto,
  PayslipServiceDto,
  PayslipSummaryDto,
  RubricasConsultaDto,
} from "../types";

export const PAYSLIPS_QUERY_KEY = ["payslips"] as const;

export function usePayslipSummary() {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "summary"],
    queryFn: () => api.get<PayslipSummaryDto>("/rh/payslips/summary"),
    retry: config.useMock ? 0 : 1,
  });
}

export function usePayslipServices() {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "services"],
    queryFn: () => api.get<PayslipServiceDto[]>("/rh/payslips/services"),
    retry: config.useMock ? 0 : 1,
  });
}

export function usePayslipHistory(limit = 24) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "history", limit],
    queryFn: () => api.get<PayslipListItemDto[]>(`/rh/payslips?limit=${limit}`),
    retry: config.useMock ? 0 : 1,
  });
}

export function usePayslipDetail(year: number | null, month: number | null) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "detail", year, month],
    queryFn: () => api.get<PayslipDetailDto>(`/rh/payslips/${year}/${month}`),
    enabled: year !== null && month !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function usePayslipComparativo(
  fromYear: number | null,
  fromMonth: number | null,
  toYear: number | null,
  toMonth: number | null,
) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "comparativo", fromYear, fromMonth, toYear, toMonth],
    queryFn: () =>
      api.get<PayslipComparativoDto>(
        `/rh/payslips/comparativo?fromYear=${fromYear}&fromMonth=${fromMonth}&toYear=${toYear}&toMonth=${toMonth}`,
      ),
    enabled: fromYear !== null && fromMonth !== null && toYear !== null && toMonth !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function useFgtsConsulta(enabled: boolean) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "fgts"],
    queryFn: () => api.get<FgtsConsultaDto>("/rh/payslips/consultas/fgts"),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useDescontosConsulta(enabled: boolean) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "descontos"],
    queryFn: () => api.get<DescontosConsultaDto>("/rh/payslips/consultas/descontos"),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useRubricasConsulta(enabled: boolean) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "rubricas"],
    queryFn: () => api.get<RubricasConsultaDto>("/rh/payslips/consultas/rubricas"),
    enabled,
    retry: config.useMock ? 0 : 1,
  });
}

export function useIncomeStatement(year: number | null, enabled: boolean) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "informe", year],
    queryFn: () => api.get<IncomeStatementDto>(`/rh/payslips/informe/${year}`),
    enabled: enabled && year !== null,
    retry: config.useMock ? 0 : 1,
  });
}

export function usePayslipRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePayslipRequestDto) =>
      api.post<PayslipRequestResultDto>("/rh/payslips/requests", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PAYSLIPS_QUERY_KEY });
    },
  });
}

export async function downloadPayslipPdf(year: number, month: number): Promise<void> {
  const blob = await api.getBlob(`/rh/payslips/${year}/${month}/pdf`);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `contracheque-${year}-${String(month).padStart(2, "0")}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function openPayslipPdfForPrint(year: number, month: number): Promise<void> {
  const blob = await api.getBlob(`/rh/payslips/${year}/${month}/pdf`);
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank", "noopener,noreferrer");

  if (!printWindow) {
    URL.revokeObjectURL(url);
    throw new Error("Não foi possível abrir o PDF para impressão.");
  }

  printWindow.addEventListener("load", () => {
    printWindow.focus();
    printWindow.print();
  });

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
