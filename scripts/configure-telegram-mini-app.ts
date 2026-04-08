import { z } from "zod";

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_BOT_USERNAME: z.string().min(1),
  TELEGRAM_WEBAPP_URL: z.string().url()
});

const env = envSchema.parse({
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
  TELEGRAM_WEBAPP_URL: process.env.TELEGRAM_WEBAPP_URL
});

const botApi = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

async function telegramRequest(method: string, body: Record<string, unknown>) {
  const response = await fetch(`${botApi}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const json = await response.json();

  if (!response.ok || !json.ok) {
    throw new Error(`Telegram API ${method} failed: ${JSON.stringify(json)}`);
  }

  return json;
}

async function main() {
  await telegramRequest("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "Открыть тренажёр",
      web_app: {
        url: env.TELEGRAM_WEBAPP_URL
      }
    }
  });

  await telegramRequest("setMyCommands", {
    commands: [
      {
        command: "start",
        description: "Открыть EGEBot Mini App"
      }
    ]
  });

  console.log(`Telegram Mini App configured for @${env.TELEGRAM_BOT_USERNAME} -> ${env.TELEGRAM_WEBAPP_URL}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
