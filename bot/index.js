import { Client, GatewayIntentBits, EmbedBuilder, ActivityType } from "discord.js";
import express from "express";

// ====== CONFIG ======
const TOKEN = process.env.TOKEN; // Put token in Render env vars
const PREFIX = ".";
const PORT = process.env.PORT || 3000;

// ====================

// Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Web Server (for UptimeRobot)
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log("Web server running on port " + PORT);
});

// When bot is ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Rich Presence
  client.user.setPresence({
    activities: [
      {
        name: "Say .say hello!",
        type: ActivityType.Playing
      }
    ],
    status: "online"
  });
});

// Message Handler
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(" ");
  const command = args.shift().toLowerCase();

  // .say command
  if (command === "say") {
    if (!args.length) {
      return message.reply("❌ Please provide text.");
    }

    const text = args.join(" ");

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📢 Message")
      .setDescription(text)
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });

    // Optional: delete user's command
    await message.delete();
  }
});

// Login
client.login(TOKEN);
