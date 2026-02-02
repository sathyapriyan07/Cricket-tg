require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const API_KEY = process.env.TMDB_KEY;
const IMG = "https://image.tmdb.org/t/p/w500";

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🎬 TMDB Bot Ready!\n\nCommands:\n/movie name\n/tv name\n/person name\n/trending"
  );
});

// MOVIE SEARCH
bot.onText(/\/movie (.+)/, async (msg, match) => {
  const q = match[1];
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}`
  );
  const data = await res.json();
  if (!data.results.length) return bot.sendMessage(msg.chat.id, "Not found");

  const m = data.results[0];
  bot.sendPhoto(msg.chat.id, IMG + m.poster_path, {
    caption:
      `🎬 ${m.title}\n⭐ ${m.vote_average}\n📅 ${m.release_date}\n\n${m.overview}`
  });
});

// TV SEARCH
bot.onText(/\/tv (.+)/, async (msg, match) => {
  const q = match[1];
  const res = await fetch(
    `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${q}`
  );
  const data = await res.json();
  if (!data.results.length) return bot.sendMessage(msg.chat.id, "Not found");

  const t = data.results[0];
  bot.sendPhoto(msg.chat.id, IMG + t.poster_path, {
    caption:
      `📺 ${t.name}\n⭐ ${t.vote_average}\n📅 ${t.first_air_date}\n\n${t.overview}`
  });
});

// PERSON SEARCH
bot.onText(/\/person (.+)/, async (msg, match) => {
  const q = match[1];
  const res = await fetch(
    `https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&query=${q}`
  );
  const data = await res.json();
  if (!data.results.length) return bot.sendMessage(msg.chat.id, "Not found");

  const p = data.results[0];
  bot.sendPhoto(msg.chat.id, IMG + p.profile_path, {
    caption:
      `👤 ${p.name}\nKnown For: ${p.known_for_department}\nPopularity: ${p.popularity}`
  });
});

// TRENDING
bot.onText(/\/trending/, async (msg) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`
  );
  const data = await res.json();

  let text = "🔥 Trending Movies:\n\n";
  data.results.slice(0, 5).forEach((m, i) => {
    text += `${i + 1}. ${m.title}\n`;
  });

  bot.sendMessage(msg.chat.id, text);
});

console.log("TMDB Bot Running...");
