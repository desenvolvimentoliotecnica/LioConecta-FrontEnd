import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { LdapConnectionTestResponse, TestLdapConnectionRequest } from "../types";

export function useTestLdapConnection() {
  return useMutation({
    mutationFn: (body: TestLdapConnectionRequest) =>
      api.post<LdapConnectionTestResponse>("/admin/ldap/test", body),
  });
}
