"use client";

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  initData: string;
  initDataUnsafe?: Record<string, unknown>;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

function getBrowserTelegramWebApp() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.Telegram?.WebApp ?? null;
}

export function hasTelegramWebApp() {
  return Boolean(getBrowserTelegramWebApp());
}

export function initTelegramWebApp() {
  const webApp = getBrowserTelegramWebApp();

  if (!webApp) {
    return null;
  }

  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor("#fbf5ed");

  return webApp;
}

export function getTelegramInitData() {
  const app = initTelegramWebApp();
  if (!app) {
    return "";
  }

  return app.initData || "";
}

export function getTelegramUserId() {
  const app = getBrowserTelegramWebApp();
  const user = app?.initDataUnsafe?.user as { id?: number | string } | undefined;
  return user?.id ? String(user.id) : "";
}
