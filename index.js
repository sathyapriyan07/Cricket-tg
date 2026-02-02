const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🎵 Music Bot Ready!\n\nCommands:\n/song name\n/artist name"
  );
});

// SONG SEARCH
bot.onText(/\/song (.+)/, async (msg, match) => {
  const query = match[1];

  try {
    const res = await fetch(
      `https://api.deezer.com/search?q=${query}`
    );
    const data = await res.json();

    if (!data.data.length) {
      bot.sendMessage(msg.chat.id, "Song not found.");
      return;
    }

    const song = data.data[0];

    bot.sendPhoto(msg.chat.id, song.album.cover_big, {
      caption:
        `🎶 ${song.title}\n` +
        `👤 ${song.artist.name}\n` +
        `💿 ${song.album.title}\n` +
        `🔗 Preview: ${song.preview}`
    });
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Error fetching music.");
  }
});

// ARTIST SEARCH
bot.onText(/\/artist (.+)/, async (msg, match) => {
  const query = match[1];

  try {
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${query}`
    );
    const data = await res.json();

    if (!data.data.length) {
      bot.sendMessage(msg.chat.id, "Artist not found.");
      return;
    }

    const artist = data.data[0];

    bot.sendPhoto(msg.chat.id, artist.picture_big, {
      caption:
        `🎤 ${artist.name}\n` +
        `Fans: ${artist.nb_fan}`
    });
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Error fetching artist.");
  }
});

console.log("Music Bot Running...");
