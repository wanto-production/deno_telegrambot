import { Context } from "grammy";

const tiktokRegex = /https?:\/\/(www\.|vt\.|vn\.|vm\.)?tiktok\.com\/[^\s]+/;

export async function tiktokFormatMiddleware(c: Context) {
  const text = c.message?.text ?? "";
  const hasUrl = text.split(" ").some((word) => tiktokRegex.test(word));

  if (!hasUrl) {
    await c.reply("Oops wrong format!");
    throw new Error("Invalid TikTok link");
  }
}
