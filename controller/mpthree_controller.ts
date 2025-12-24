import { composeHandler } from "@/utils/decorators/defineMethod.ts";
import { Context } from "grammy/mod.ts";
import type { TikTokApiResponse } from "@/types.ts";

export class MpThreeController {
  static main = composeHandler([], async (c: Context): Promise<void> => {
    let message;
    try {
      message = await c.reply("wait longitude...");
      const body = c.message?.text?.split(" ").slice(1).join(" "); // Join the remaining parts to form the complete URL

      // Create an abort controller with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const res = await fetch(
        `https://tiktok-download-without-watermark.p.rapidapi.com/analysis?url=${body}&hd=0`,
        {
          headers: {
            "x-rapidapi-key": Deno.env.get("RAPIDAPI_KEY") as string,
            "x-rapidapi-host":
              "tiktok-download-without-watermark.p.rapidapi.com",
          },
          signal: controller.signal
        },
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }

      const data = await res.json() as TikTokApiResponse;

      if (data.message) {
        await c.reply("Oops maaf token untuk convert video telah habis");
        if (message?.message_id) {
          await c.api.deleteMessage(c.chatId as number, message.message_id);
        }
        return;
      }

      if (data.code < 0) {
        await c.reply(`Oops ${data.msg}`);
        if (message?.message_id) {
          await c.api.deleteMessage(c.chatId as number, message.message_id);
        }
        return;
      }

      if (data.data.music) {
        await c.api.sendAudio(c.chatId as number, data.data.music, {
          caption: `${body}\n\n@TiktokConverterWanto\nCompleted! ✅`,
          title: "TikTok Audio", // opsional
          performer: "TikTok", // opsional
        });
        if (message?.message_id) {
          await c.api.deleteMessage(c.chatId as number, message.message_id);
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);

      // Check if the error is due to timeout
      if (error instanceof Error && error.name === 'AbortError') {
        await c.reply("Request timeout. The TikTok API is taking too long to respond.");
      } else {
        await c.reply("An error occurred while processing your request.");
      }

      // Delete the waiting message if it exists
      if (message?.message_id) {
        try {
          await c.api.deleteMessage(c.chatId as number, message.message_id);
        } catch (deleteError) {
          console.error("Failed to delete waiting message:", deleteError);
        }
      }
    }
  });
}
