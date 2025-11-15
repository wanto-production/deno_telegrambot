import { composeHandler } from "@/utils/decorators/defineMethod.ts";
import { Context } from "grammy/mod.ts";
import type { TikTokApiResponse } from "@/types.ts";

export class MpThreeController {
  static main = composeHandler([], async (c: Context): Promise<void> => {
    try {
      const message = await c.reply("wait🕛...");
      const body = c.message?.text?.split(" ").slice(1);

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

      if (data.data.music) {
        await c.api.sendAudio(c.chatId as number, data.data.music, {
          caption: `${body}\n\n@TiktokConverterWanto\nCompleted! ✅`,
          title: "TikTok Audio", // opsional
          performer: "TikTok", // opsional
        });
        c.api.deleteMessage(c.chatId as number, message.message_id);
      }
    } catch (error) {
      console.error("Error processing request:", error);
      await c.reply("An error occurred while processing your request.");
    }
  });
}
