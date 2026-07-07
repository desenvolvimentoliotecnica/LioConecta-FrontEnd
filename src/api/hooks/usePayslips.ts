import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import { downloadBlobWithToast } from "../../utils/payslipToast";
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
const PAYSLIP_CACHE_MS = 24 * 60 * 60 * 1000;

export function usePayslipSummary() {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "summary"],
    queryFn: () => api.get<PayslipSummaryDto>("/rh/payslips/summary"),
    retry: config.useMock ? 0 : 1,
    staleTime: PAYSLIP_CACHE_MS,
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
    staleTime: PAYSLIP_CACHE_MS,
  });
}

export function usePayslipDetail(
  year: number | null,
  month: number | null,
  paymentType?: string | null,
) {
  const paymentQuery =
    paymentType && paymentType !== "FOLHA"
      ? `?paymentType=${encodeURIComponent(paymentType)}`
      : "";

  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "detail", year, month, paymentType ?? "FOLHA"],
    queryFn: () =>
      api.get<PayslipDetailDto>(`/rh/payslips/${year}/${month}${paymentQuery}`),
    enabled: year !== null && month !== null,
    retry: config.useMock ? 0 : 1,
    staleTime: PAYSLIP_CACHE_MS,
    gcTime: PAYSLIP_CACHE_MS,
    refetchOnWindowFocus: false,
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
    staleTime: PAYSLIP_CACHE_MS,
  });
}

export function useFgtsConsulta(enabled: boolean) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "fgts"],
    queryFn: () => api.get<FgtsConsultaDto>("/rh/payslips/consultas/fgts"),
    enabled,
    retry: config.useMock ? 0 : 1,
    staleTime: PAYSLIP_CACHE_MS,
  });
}

export function useDescontosConsulta(enabled: boolean) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "descontos"],
    queryFn: () => api.get<DescontosConsultaDto>("/rh/payslips/consultas/descontos"),
    enabled,
    retry: config.useMock ? 0 : 1,
    staleTime: PAYSLIP_CACHE_MS,
  });
}

export function useRubricasConsulta(enabled: boolean) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "rubricas"],
    queryFn: () => api.get<RubricasConsultaDto>("/rh/payslips/consultas/rubricas"),
    enabled,
    retry: config.useMock ? 0 : 1,
    staleTime: PAYSLIP_CACHE_MS,
  });
}

export function useIncomeStatement(year: number | null, enabled: boolean) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, "informe", year],
    queryFn: () => api.get<IncomeStatementDto>(`/rh/payslips/informe/${year}`),
    enabled: enabled && year !== null,
    retry: config.useMock ? 0 : 1,
    staleTime: PAYSLIP_CACHE_MS,
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

export async function downloadPayslipPdf(
  year: number,
  month: number,
  paymentType?: string,
): Promise<void> {
  const paymentQuery =
    paymentType && paymentType !== "FOLHA"
      ? `?paymentType=${encodeURIComponent(paymentType)}`
      : "";

  await downloadBlobWithToast(
    api.getBlob(`/rh/payslips/${year}/${month}/pdf${paymentQuery}`),
    `contracheque-${year}-${String(month).padStart(2, "0")}.pdf`,
    `O PDF do holerite ${String(month).padStart(2, "0")}/${year} foi salvo com sucesso.`,
  );
}

export async function downloadComprovantePdf(): Promise<void> {
  await downloadBlobWithToast(
    api.getBlob("/rh/payslips/comprovante/pdf"),
    "comprovante-rendimentos.pdf",
    "Comprovante de rendimentos emitido com sucesso.",
  );
}

export async function downloadCartaConsignacaoPdf(): Promise<void> {
  await downloadBlobWithToast(
    api.getBlob("/rh/payslips/carta-consignacao/pdf"),
    "carta-consignacao.pdf",
    "Carta de consignação emitida com sucesso.",
  );
}

export async function openPayslipPdfForPrint(
  year: number,
  month: number,
  paymentType?: string,
): Promise<void> {
  const paymentQuery =
    paymentType && paymentType !== "FOLHA"
      ? `?paymentType=${encodeURIComponent(paymentType)}`
      : "";
  const blob = await api.getBlob(`/rh/payslips/${year}/${month}/pdf${paymentQuery}`);
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
