import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { MeDto } from "../types";

const MOCK_ME: MeDto = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "maria-silva",
  name: "Maria Silva",
  email: "maria.silva@liotecnica.com.br",
  title: "Gerente de Projetos",
  photoUrl: "/avatar-maria-silva.png",
  departmentName: "Produto",
  roles: ["Employee", "Manager", "Admin"],
};

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<MeDto> => {
      if (config.useMock) {
        return MOCK_ME;
      }
      return api.get<MeDto>("/me");
    },
    staleTime: 5 * 60 * 1000,
    retry: config.useMock ? 0 : 2,
  });
}
