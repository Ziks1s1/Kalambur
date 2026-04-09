"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import { getTelegramInitData, getTelegramUserId, hasTelegramWebApp } from "@/lib/telegram/webapp";
import { telegramAuthResponseSchema } from "@/schemas/auth";

type AuthResponse = z.infer<typeof telegramAuthResponseSchema>;
type SessionUser = AuthResponse["user"] | null;

export function useSessionUser() {
  const queryClient = useQueryClient();
  const [telegramContext, setTelegramContext] = useState(false);
  const [telegramInitData, setTelegramInitData] = useState("");
  const [telegramUserId, setTelegramUserId] = useState("");

  useEffect(() => {
    let attempts = 0;

    const syncContext = () => {
      const initData = getTelegramInitData();
      const hasContext = hasTelegramWebApp() || Boolean(initData);

      setTelegramContext(hasContext);
      setTelegramInitData(initData);
      setTelegramUserId(getTelegramUserId());

      attempts += 1;

      if (!hasContext && attempts < 12) {
        window.setTimeout(syncContext, 250);
      }
    };

    syncContext();
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

  const login = () => {
    if (!telegramInitData) {
      throw new Error("Telegram init data not available");
    }

    authMutation.mutate(telegramInitData);
  };

  return {
    user: authMutation.data?.user ?? meQuery.data ?? null,
    isLoading: meQuery.isLoading || authMutation.isPending,
    isAuthenticated: Boolean(authMutation.data?.user ?? meQuery.data),
    isAdmin: (authMutation.data?.user ?? meQuery.data)?.role === "ADMIN",
    isTelegramContext: telegramContext,
    telegramUserId,
    canAuthenticate: Boolean(telegramInitData),
    login,
    authError: authMutation.error ?? (meQuery.error instanceof Error ? meQuery.error : null)
  };
}
