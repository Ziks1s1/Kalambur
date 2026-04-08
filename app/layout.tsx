import type { Metadata } from "next";

import "@/app/globals.css";

import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "EGEBot Mini App",
  description: "Telegram Mini App для подготовки ко второй части ЕГЭ"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <div className="mx-auto min-h-screen max-w-md">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
