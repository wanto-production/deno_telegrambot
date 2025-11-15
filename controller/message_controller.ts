import { composeHandler } from "@/utils/decorators/defineMethod.ts";
import { tiktokFormatMiddleware } from "@/utils/middleware/tiktok_format.ts";

import type { Context } from "grammy/mod.ts";
import { InputMediaBuilder } from "grammy/mod.ts";
import { TikTokApiResponse } from "@/types.ts";

export class MessageController {
  static main = composeHandler(
    [tiktokFormatMiddleware],
    async (c: Context): Promise<void> => {
      try {
        const message = await c.reply("wait🕛...");
        const body = c.message?.text?.split(" ")[0];

        const res = await fetch(
          `https://tiktok-download-without-watermark.p.rapidapi.com/analysis?url=${body}&hd=0`,
          {
            headers: {
              "x-rapidapi-key": Deno.env.get("RAPIDAPI_KEY") as string,
              "x-rapidapi-host":
                "tiktok-download-without-watermark.p.rapidapi.com",
            },
          },
        );

        const data = await res.json() as TikTokApiResponse;

        if (data.message) {
          await c.reply("Oops maaf token untuk convert video telah habis").then(
            () => c.api.deleteMessage(c.chatId as number, message.message_id),
          );
          return;
        }

        if (data.code < 0) {
          await c.reply(`Oops ${data.msg}`).then(() =>
            c.api.deleteMessage(c.chatId as number, message.message_id)
          );
          return;
        }

        if (data.data?.images) {
          const imageMap = data.data.images.map((image: string) =>
            InputMediaBuilder.photo(image)
          );

          await c.replyWithMediaGroup(imageMap).then(() =>
            c.reply(`${body}\n\n @TiktokConverterWanto\nCompleted! ✅`)
          );

          c.api.deleteMessage(c.chatId as number, message.message_id);
          return;
        }

        if ((data.data.play as string).includes("mp4")) {
          await c.api.sendVideo(c.chatId as number, data.data.play, {
            caption: `${body}\n\n @TiktokConverterWanto\nCompleted! ✅`,
          });
          c.api.deleteMessage(c.chatId as number, message.message_id);
          return;
        }
      } catch (error) {
        console.error("Error processing request:", error);
        await c.reply("An error occurred while processing your request.");
      }
    },
  );
}
