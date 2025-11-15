# TikTok Converter Telegram Bot

A Telegram bot built with Deno and the [Grammy](https://grammy.dev/) framework that converts TikTok links to videos, photos, and audio (MP3) without watermarks.

## Features

- Convert TikTok video links to MP4 files without watermarks
- Extract images from TikTok posts (when the post contains multiple images)
- Extract audio from TikTok videos as MP3 files
- Automatic format detection and conversion
- Clean and user-friendly interface

## Commands

- `/start` - Display welcome message and bot description
- `/mp3` - Download the audio track from a TikTok video as MP3
- Send any TikTok link in a message to convert it to video or images (without watermarks)

## Prerequisites

- [Deno](https://deno.land/) (v1.30 or higher)
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- RapidAPI account and TikTok API key from [TikTok Download Without Watermark API](https://rapidapi.com/abdelatif98/api/tiktok-download-without-watermark/)

## Installation

1. Clone or download the repository:

```bash
git clone <your-repository-url>
cd bot-tele
```

2. Create a `.env` file in the project root with the following content:

```env
BOT_TOKEN=your_telegram_bot_token_here
RAPIDAPI_KEY=your_rapidapi_key_here
ENVIRONMENT=development  # or remove this line for production
```

3. Install dependencies (Deno handles this automatically)

## Usage

### Development

To run the bot in development mode:

```bash
deno task dev
# or
deno run --watch --env-file -A main.ts
```

### Production

For production deployments, the bot uses webhooks. Make sure to set up your webhook URL with Telegram and avoid setting the `ENVIRONMENT` variable to `development` in production.

## Project Structure

```
bot-tele/
├── main.ts                 # Main bot file, contains command handlers
├── types.ts                # TypeScript interfaces for API responses
├── controller/
│   ├── message_controller.ts   # Handles text messages (TikTok links)
│   └── mpthree_controller.ts   # Handles MP3 conversion requests
└── utils/
    ├── decorators/
    │   └── defineMethod.ts     # Middleware composition utilities
    └── middleware/
        ├── reply_detect.ts     # (Not implemented in provided code)
        └── tiktok_format.ts    # Validates TikTok URL format
```

## How It Works

1. The bot listens for commands and text messages
2. When a TikTok URL is detected:
   - For images: Groups of images are sent as a media group
   - For videos: Video is sent without watermark
   - For audio: Audio is extracted as MP3 using the `/mp3` command
3. The bot uses a TikTok API service via RapidAPI to fetch the content

## Configuration

The bot supports two environments:

- **Development**: Uses long polling with `bot.start()`
- **Production**: Uses webhooks with `Deno.serve()`

Set the `ENVIRONMENT` variable in your `.env` file to control this behavior.

## API Integration

This bot uses the [TikTok Download Without Watermark API](https://rapidapi.com/abdelatif98/api/tiktok-download-without-watermark/) from RapidAPI to extract TikTok content. The API key is required to access this service.

## Environment Variables

- `BOT_TOKEN`: Your Telegram bot token from [@BotFather](https://t.me/BotFather)
- `RAPIDAPI_KEY`: Your RapidAPI key for the TikTok API
- `ENVIRONMENT`: Set to `development` to enable long polling mode (optional)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Grammy](https://grammy.dev/) Telegram Bot Framework
- Powered by [Deno](https://deno.land/)
- Uses TikTok Download Without Watermark API from RapidAPI