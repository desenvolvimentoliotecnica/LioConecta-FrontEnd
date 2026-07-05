import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  ComunicadoHeroTemplateDto,
  ComunicadoHeroUploadDto,
  UploadComunicadoHeroResponseDto,
} from "../types";
import { COMUNICADO_HERO_TEMPLATES } from "../../config/comunicado-hero-templates";

export const HERO_TEMPLATES_QUERY_KEY = ["comunicados", "hero-images", "templates"] as const;
export const HERO_UPLOADS_QUERY_KEY = ["comunicados", "hero-images", "uploads"] as const;

export function useComunicadoHeroTemplates() {
  return useQuery({
    queryKey: HERO_TEMPLATES_QUERY_KEY,
    queryFn: async (): Promise<ComunicadoHeroTemplateDto[]> => {
      if (config.useMock) {
        return COMUNICADO_HERO_TEMPLATES.map((item) => ({
          id: item.id,
          label: item.label,
          url: item.url,
          category: item.category ?? null,
        }));
      }
      return api.get<ComunicadoHeroTemplateDto[]>("/comunicados/hero-images/templates");
    },
    staleTime: 60_000,
  });
}

export function useComunicadoHeroUploads(limit = 24) {
  return useQuery({
    queryKey: [...HERO_UPLOADS_QUERY_KEY, limit],
    queryFn: async (): Promise<ComunicadoHeroUploadDto[]> => {
      if (config.useMock) return [];
      return api.get<ComunicadoHeroUploadDto[]>(`/comunicados/hero-images/uploads?limit=${limit}`);
    },
    staleTime: 15_000,
  });
}

export function useUploadComunicadoHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      assetId,
    }: {
      file: File;
      assetId?: string;
    }): Promise<UploadComunicadoHeroResponseDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — upload indisponível");
      }

      const formData = new FormData();
      formData.append("file", file);
      if (assetId) {
        formData.append("assetId", assetId);
      }

      return api.upload<UploadComunicadoHeroResponseDto>(
        "/comunicados/hero-images/upload",
        formData,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HERO_UPLOADS_QUERY_KEY });
    },
  });
}

export function extractUploadErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "body" in error) {
    const body = (error as { body?: unknown }).body;
    if (body && typeof body === "object" && "message" in body) {
      const message = (body as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Não foi possível enviar a imagem.";
}
