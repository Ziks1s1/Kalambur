"use client";

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  initData: string;
  initDataUnsafe?: {
    user?: {
      id?: number | string;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  };
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
  const user = app?.initDataUnsafe?.user;
  return user?.id ? String(user.id) : "";
}

export function getTelegramUserProfile() {
  const app = getBrowserTelegramWebApp();
  const user = app?.initDataUnsafe?.user;

  if (!user?.id || !user.first_name) {
    return null;
  }

  return {
    telegramId: String(user.id),
    username: user.username ?? null,
    firstName: user.first_name,
    lastName: user.last_name ?? null
  };
}
