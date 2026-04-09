import type { Metadata } from "next";
import Script from "next/script";

import "@/app/globals.css";

import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Kalambur EGE",
  description: "Telegram Mini App для подготовки ко второй части ЕГЭ"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="text-ink">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <Providers>
          <div className="mx-auto min-h-screen max-w-md px-3 py-3">
            <div className="min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 shadow-[0_24px_80px_rgba(33,24,16,0.12)] backdrop-blur-xl">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
