import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { MeDto } from "../types";

const MOCK_ME: MeDto = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb103",
  slug: "leonardo-sabino-mendes",
  name: "Leonardo Sabino Mendes",
  email: "leonardo.mendes@liotecnica.com.br",
  title: "Desenvolvedor Sr.",
  photoUrl: "/avatar-carlos-mendes.png",
  departmentName: "Sistemas",
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
