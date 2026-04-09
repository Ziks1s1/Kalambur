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
  return app?.initData ?? "";
}
