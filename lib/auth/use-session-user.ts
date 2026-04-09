"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import { getTelegramUserId, getTelegramUserProfile, hasTelegramWebApp } from "@/lib/telegram/webapp";
import { telegramAuthResponseSchema, telegramIdAuthRequestSchema } from "@/schemas/auth";

type AuthResponse = z.infer<typeof telegramAuthResponseSchema>;
type SessionUser = AuthResponse["user"] | null;
type TelegramUserProfile = z.infer<typeof telegramIdAuthRequestSchema>;

export function useSessionUser() {
  const queryClient = useQueryClient();
  const [telegramContext, setTelegramContext] = useState(false);
  const [telegramUserId, setTelegramUserId] = useState("");
  const [telegramUserProfile, setTelegramUserProfile] = useState<TelegramUserProfile | null>(null);

  useEffect(() => {
    let attempts = 0;

    const syncContext = () => {
      const profile = getTelegramUserProfile();
      const hasContext = hasTelegramWebApp() || Boolean(profile);

      setTelegramContext(hasContext);
      setTelegramUserProfile(profile);
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
      try {
        const response = await apiClient("/api/auth/me", {
          schema: telegramAuthResponseSchema
        });

        return response.user;
      } catch {
        return null;
      }
    },
    retry: false
  });

  const authMutation = useMutation<AuthResponse, Error, TelegramUserProfile>({
    mutationFn: (profile: TelegramUserProfile) =>
      apiClient("/api/auth/telegram-id", {
        method: "POST",
        body: profile,
        schema: telegramAuthResponseSchema
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(["session-user"], response.user);
    }
  });

  const login = () => {
    if (!telegramUserProfile) {
      throw new Error("Telegram user profile not available");
    }

    authMutation.mutate(telegramUserProfile);
  };

  return {
    user: authMutation.data?.user ?? meQuery.data ?? null,
    isLoading: meQuery.isLoading || authMutation.isPending,
    isAuthenticated: Boolean(authMutation.data?.user ?? meQuery.data),
    isAdmin: (authMutation.data?.user ?? meQuery.data)?.role === "ADMIN",
    isTelegramContext: telegramContext,
    telegramUserId,
    canAuthenticate: Boolean(telegramUserProfile),
    login,
    authError: authMutation.error ?? null
  };
}
