import { composeHandler } from "@/utils/decorators/defineMethod.ts";
import { tiktokFormatMiddleware } from "@/utils/middleware/tiktok_format.ts";

import type { Context } from "grammy/mod.ts";
import { InputMediaBuilder } from "grammy/mod.ts";
import { TikTokApiResponse } from "@/types.ts";

export class MessageController {
  static main = composeHandler(
    [tiktokFormatMiddleware],
    async (c: Context): Promise<void> => {
      let message;
      try {
        const message = await c.reply("wait longitude...");
        const body = c.message?.text?.split(" ")[0];

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

        if (data.data?.images) {
          const imageMap = data.data.images.map((image: string) =>
            InputMediaBuilder.photo(image)
          );

          await c.replyWithMediaGroup(imageMap);
          await c.reply(`${body}\n\n @TiktokConverterWanto\nCompleted! ✅`);

          if (message?.message_id) {
            await c.api.deleteMessage(c.chatId as number, message.message_id);
          }
          return;
        }

        if ((data.data.play as string).includes("mp4")) {
          await c.api.sendVideo(c.chatId as number, data.data.play, {
            caption: `${body}\n\n @TiktokConverterWanto\nCompleted! ✅`,
          });
          if (message?.message_id) {
            await c.api.deleteMessage(c.chatId as number, message.message_id);
          }
          return;
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
    },
  );
}
