"use client";

import WebApp from "@twa-dev/sdk";

export function initTelegramWebApp() {
  if (typeof window === "undefined") {
    return null;
  }

  WebApp.ready();
  WebApp.expand();
  WebApp.setHeaderColor("#f4f7fb");
  return WebApp;
}

export function getTelegramInitData() {
  const app = initTelegramWebApp();
  return app?.initData ?? "";
}
