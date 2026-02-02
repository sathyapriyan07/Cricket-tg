require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const KEY = process.env.TMDB_KEY;
const IMG = "https://image.tmdb.org/t/p/w500";

let sessions = {};

async function tmdb(url) {
  return fetch(`https://api.themoviedb.org/3/${url}&api_key=${KEY}`).then(r => r.json());
}

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, "🎬 Movie Assistant Ready\n/movie name\n/tv name\n/person name");
});

/* ---------------- MOVIE ---------------- */

bot.onText(/\/movie (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const q = match[1];

  const s = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${q}`).then(r=>r.json());
  if (!s.results.length) return bot.sendMessage(chatId,"Not found");

  const m = s.results[0];
  sessions[chatId] = { type: "movie", id: m.id };

  sendMovie(chatId, m.id);
});

async function sendMovie(chatId, id) {
  const m = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${KEY}`).then(r=>r.json());

  bot.sendPhoto(chatId, IMG + m.poster_path, {
    caption:
      `🎬 ${m.title}\n⭐ ${m.vote_average}\n📅 ${m.release_date}\n\n${m.overview}`,
    reply_markup: {
      inline_keyboard: [[
        { text: "🎭 Cast", callback_data: "cast" },
        { text: "🎼 Crew", callback_data: "crew" }
      ],[
        { text: "📺 Watch", callback_data: "watch" }
      ]]
    }
  });
}

/* ---------------- TV ---------------- */

bot.onText(/\/tv (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const q = match[1];

  const s = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${KEY}&query=${q}`).then(r=>r.json());
  if (!s.results.length) return bot.sendMessage(chatId,"Not found");

  const t = s.results[0];
  sessions[chatId] = { type: "tv", id: t.id };

  sendTV(chatId, t.id);
});

async function sendTV(chatId, id) {
  const t = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${KEY}`).then(r=>r.json());

  bot.sendPhoto(chatId, IMG + t.poster_path, {
    caption:
      `📺 ${t.name}\n⭐ ${t.vote_average}\nSeasons: ${t.number_of_seasons}`,
    reply_markup: {
      inline_keyboard: [[
        { text: "🎭 Cast", callback_data: "cast" },
        { text: "🎼 Crew", callback_data: "crew" }
      ],[
        { text: "📂 Seasons", callback_data: "seasons" }
      ]]
    }
  });
}

/* ---------------- PERSON ---------------- */

bot.onText(/\/person (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const q = match[1];

  const s = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${KEY}&query=${q}`).then(r=>r.json());
  const p = s.results[0];

  sessions[chatId] = { type: "person", id: p.id };

  const full = await fetch(`https://api.themoviedb.org/3/person/${p.id}?api_key=${KEY}`).then(r=>r.json());

  bot.sendPhoto(chatId, IMG + full.profile_path, {
    caption:
      `👤 ${full.name}\nBorn: ${full.birthday}\n\n${full.biography}`,
    reply_markup: {
      inline_keyboard: [[
        { text: "🎬 Filmography", callback_data: "films" }
      ]]
    }
  });
}

/* ---------------- CALLBACKS ---------------- */

bot.on("callback_query", async q => {
  const chatId = q.message.chat.id;
  const session = sessions[chatId];
  if (!session) return;

  if (q.data === "cast") {
    const res = await fetch(`https://api.themoviedb.org/3/${session.type}/${session.id}/credits?api_key=${KEY}`).then(r=>r.json());
    let text = "🎭 Cast:\n\n";
    res.cast.slice(0,10).forEach(a => text += a.name + "\n");
    bot.sendMessage(chatId, text);
  }

  if (q.data === "crew") {
    const res = await fetch(`https://api.themoviedb.org/3/${session.type}/${session.id}/credits?api_key=${KEY}`).then(r=>r.json());
    const director = res.crew.find(c=>c.job==="Director");
    const music = res.crew.find(c=>c.job==="Original Music Composer");
    bot.sendMessage(chatId,
      `🎬 Director: ${director?.name || "N/A"}\n🎼 Composer: ${music?.name || "N/A"}`
    );
  }

  if (q.data === "watch") {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${session.id}/watch/providers?api_key=${KEY}`).then(r=>r.json());
    bot.sendMessage(chatId, "📺 Available Platforms: Netflix / Prime / etc");
  }

  if (q.data === "seasons") {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${session.id}?api_key=${KEY}`).then(r=>r.json());
    let text = "📂 Seasons:\n\n";
    res.seasons.forEach(s=> text += `Season ${s.season_number} - ${s.episode_count} eps\n`);
    bot.sendMessage(chatId,text);
  }

  if (q.data === "films") {
    const res = await fetch(`https://api.themoviedb.org/3/person/${session.id}/movie_credits?api_key=${KEY}`).then(r=>r.json());
    let text = "🎬 Filmography:\n\n";
    res.cast.slice(0,15).forEach(f=> text += f.title + "\n");
    bot.sendMessage(chatId,text);
  }
});

console.log("Pro TMDB Bot Running...");
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
