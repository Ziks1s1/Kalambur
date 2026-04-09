"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import { getTelegramInitData, hasTelegramWebApp } from "@/lib/telegram/webapp";
import { telegramAuthResponseSchema } from "@/schemas/auth";

type AuthResponse = z.infer<typeof telegramAuthResponseSchema>;
type SessionUser = AuthResponse["user"] | null;

export function useSessionUser() {
  const queryClient = useQueryClient();
  const [telegramContext, setTelegramContext] = useState(false);

  useEffect(() => {
    const syncContext = () => setTelegramContext(hasTelegramWebApp());

    syncContext();
    const timeout = window.setTimeout(syncContext, 400);

    return () => window.clearTimeout(timeout);
  }, []);

  const meQuery = useQuery<SessionUser>({
    queryKey: ["session-user"],
    queryFn: async () => {
      const response = await apiClient("/api/auth/me", {
        schema: telegramAuthResponseSchema
      });

      return response.user;
    },
    retry: false
  });

  const authMutation = useMutation<AuthResponse, Error, string>({
    mutationFn: (initData: string) =>
      apiClient("/api/auth/telegram", {
        method: "POST",
        body: { initData },
        schema: telegramAuthResponseSchema
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(["session-user"], response.user);
    }
  });

  useEffect(() => {
    if (!telegramContext) {
      return;
    }

    if (meQuery.data || meQuery.isLoading || authMutation.isPending || authMutation.isSuccess) {
      return;
    }

    if (meQuery.error) {
      const initData = getTelegramInitData();

      if (initData) {
        authMutation.mutate(initData);
      }
    }
  }, [authMutation, meQuery.data, meQuery.error, meQuery.isLoading, telegramContext]);

  return {
    user: authMutation.data?.user ?? meQuery.data ?? null,
    isLoading: meQuery.isLoading || authMutation.isPending,
    isAuthenticated: Boolean(authMutation.data?.user ?? meQuery.data),
    isAdmin: (authMutation.data?.user ?? meQuery.data)?.role === "ADMIN",
    isTelegramContext: telegramContext
  };
}
