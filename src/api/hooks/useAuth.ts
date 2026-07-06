import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import type { LoginRequest, LoginResponse } from "../types";

export const AUTH_TOKEN_KEY = "lioconecta.auth.token";

export function getStoredToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginRequest) => api.post<LoginResponse>("/auth/login", body),
    onSuccess: (data) => {
      setStoredToken(data.accessToken);
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post("/auth/logout");
      } catch {
        // Token may already be invalid — still clear local session.
      }
    },
    onSettled: () => {
      setStoredToken(null);
      queryClient.clear();
    },
  });
}
