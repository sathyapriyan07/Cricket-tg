require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

// ENV VARIABLES
const token = process.env.BOT_TOKEN;
const API_KEY = process.env.CRIC_API_KEY;

// CREATE BOT
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🏏 Welcome to Cricket Bot!\n\nCommands:\n/live - Live Matches\n/player name - Player Info"
  );
});

// LIVE MATCHES
bot.onText(/\/live/, async (msg) => {
  try {
    const res = await fetch(
      `https://api.cricketdata.org/v1/matches?apikey=${API_KEY}`
    );
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      bot.sendMessage(msg.chat.id, "No live matches now.");
      return;
    }

    let reply = "🔥 Live Matches:\n\n";
    data.data.slice(0, 5).forEach((m) => {
      reply += `${m.name}\nStatus: ${m.status}\n\n`;
    });

    bot.sendMessage(msg.chat.id, reply);
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Error fetching live scores.");
  }
});

// PLAYER SEARCH
bot.onText(/\/player (.+)/, async (msg, match) => {
  const name = match[1];

  try {
    const res = await fetch(
      `https://api.cricketdata.org/v1/players?apikey=${API_KEY}&search=${name}`
    );
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      bot.sendMessage(msg.chat.id, "Player not found.");
      return;
    }

    const p = data.data[0];
    const reply = `👤 ${p.name}\nCountry: ${p.country}\nRole: ${p.role}`;

    bot.sendMessage(msg.chat.id, reply);
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Error fetching player data.");
  }
});

console.log("Bot Running...");
