"use client";

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  initData: string;
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

export function initTelegramWebApp() {
  const webApp = getBrowserTelegramWebApp();

  if (!webApp) {
    return null;
  }

  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor("#f4f7fb");

  return webApp;
}

export function getTelegramInitData() {
  const app = initTelegramWebApp();
  return app?.initData ?? "";
}
