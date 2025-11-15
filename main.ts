import { Bot, webhookCallback } from "grammy/mod.ts";
import { MessageController } from "@/controller/message_controller.ts";
import { MpThreeController } from "@/controller/mpthree_controller.ts";

const bot = new Bot(Deno.env.get("BOT_TOKEN")!);

bot.api.setMyCommands([
  { command: "start", description: "bot description" },
  { command: "mp3", description: "install mp3 from link" },
]);

bot.command("start", (c) => {
  c.reply(
    "hello🤖,\ni am a telegram bot\nmade by t.me/iwanSlebew to convert tiktok links to video/photos.\n",
  );
});

bot.command("mp3", MpThreeController.main);

bot.on("message:text", MessageController.main);

if (Deno.env.get("ENVIRONMENT") === "development") {
  console.log("🤖 Bot running in development mode...");
  bot.start();
}

if (Deno.env.get("ENVIRONMENT") !== "development") {
  Deno.serve((req) => {
    return webhookCallback(bot, "std/http")(req); // FIXED: Panggil function hasil webhookCallback
  });
}
