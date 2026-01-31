// index.js
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

// --- Environment variables ---
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !GUILD_ID) {
  console.error("Missing required environment variables: TOKEN or GUILD_ID");
  process.exit(1);
}

// --- Command prefix ---
const PREFIX = ".";

// --- Discord client ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// --- TSVM Role hierarchy ---
const ranks = [
  ["☠ The Black Sovereign", "#1A0000"],
  ["♠ The Obsidian Don", "#2B0000"],

  ["♛ Crimson Regent III", "#3B0000"],
  ["♛ Crimson Regent II", "#4A0000"],
  ["♛ Crimson Regent I", "#5A0000"],

  ["♦ Vendetta Marshal III", "#6B0000"],
  ["♦ Vendetta Marshal II", "#7A0000"],
  ["♦ Vendetta Marshal I", "#8A0000"],

  ["♣ Blood Executor III", "#9B0000"],
  ["♣ Blood Executor II", "#B00000"],
  ["♣ Blood Executor I", "#C40000"],

  ["♜ Crypt Broker III", "#7A1F1F"],
  ["♜ Crypt Broker II", "#8A2B2B"],
  ["♜ Crypt Broker I", "#9B3A3A"],

  ["☽ Night Operative III", "#1E1E1E"],
  ["☽ Night Operative II", "#2E2E2E"],
  ["☽ Night Operative I", "#3E3E3E"],

  ["✠ Syndicate Agent III", "#1F2A2E"],
  ["✠ Syndicate Agent II", "#2F3A3E"],
  ["✠ Syndicate Agent I", "#3F4A4E"],

  ["○ Initiate III", "#004422"],
  ["○ Initiate II", "#006633"],
  ["○ Initiate I", "#008844"],

  ["△ Prospect", "#2A2A2A"],
  ["▽ Asset", "#3A3A3A"],
  ["□ Contact", "#4A4A4A"]
];

// --- Express server to stay alive on Render ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("TSVM bot is alive."));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// --- Ready event ---
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag} ✅`);
});

// --- Message command handler ---
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "rolecreate") {
    const guild = message.guild;
    if (!guild) return message.reply("This command can only be used in a server.");

    // Immediate reply to prevent timeout
    const replyMsg = await message.reply("Starting TSVM role creation... this may take a moment.");

    try {
      for (const [name, color] of ranks.reverse()) {
        await guild.roles.create({
          name,
          color,
          hoist: true,
          reason: "TSVM Black Ledger hierarchy"
        });
      }
      await replyMsg.edit("All TSVM roles have been created ✅");
    } catch (err) {
      console.error("Error creating roles:", err);
      await replyMsg.edit("Failed to create roles. Make sure the bot has permission to Manage Roles and is higher than the roles being created.");
    }
  }
});

// --- Login with error handling ---
client.login(TOKEN)
  .then(() => console.log("Bot successfully logged in!"))
  .catch(err => console.error("Failed to login:", err));
