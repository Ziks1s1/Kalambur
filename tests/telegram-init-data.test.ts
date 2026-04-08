import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyTelegramInitData } from "@/lib/telegram/init-data";

function buildInitData() {
  const user = {
    id: 1,
    first_name: "Test",
    username: "tester"
  };
  const authDate = Math.floor(Date.now() / 1000).toString();
  const params = new URLSearchParams({
    auth_date: authDate,
    query_id: "AAEAAAE",
    user: JSON.stringify(user)
  });

  const dataCheckString = Array.from(params.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.TELEGRAM_BOT_TOKEN ?? "")
    .digest();

  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  params.set("hash", hash);
  return params.toString();
}

describe("verifyTelegramInitData", () => {
  it("accepts a valid telegram payload", () => {
    const payload = verifyTelegramInitData(buildInitData());
    expect(payload.id).toBe(1);
    expect(payload.first_name).toBe("Test");
  });
});
