const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder 
} = require("discord.js");
const express = require("express");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/* ---------------- WEB SERVER (RENDER KEEP ALIVE) ---------------- */
const app = express();
app.get("/", (req, res) => res.send("TSVM Bot is running."));
app.listen(3000, () => console.log("Web server active"));

/* ---------------- TSVM ROLE LIST (LOWEST → HIGHEST) ---------------- */
const tsvmRoles = [
  { name: "⌖ Contact", color: "#FFFF66" },
  { name: "⌘ Asset", color: "#FFEB33" },
  { name: "✦ Prospect", color: "#FFE000" },

  { name: "✪ Initiate I", color: "#FFD633" },
  { name: "✫ Initiate II", color: "#FFCC00" },
  { name: "✬ Initiate III", color: "#FFB800" },

  { name: "⚜ Syndicate Agent I", color: "#FFA500" },
  { name: "⚚ Syndicate Agent II", color: "#FF9500" },
  { name: "✵ Syndicate Agent III", color: "#FF8500" },

  { name: "☾ Night Operative I", color: "#FF751A" },
  { name: "☽ Night Operative II", color: "#FF6600" },
  { name: "⛧ Night Operative III", color: "#FF4D00" },

  { name: "♖ Crypt Broker I", color: "#FF3300" },
  { name: "♖ Crypt Broker II", color: "#FF1A00" },
  { name: "♖ Crypt Broker III", color: "#FF0000" },

  { name: "♣ Blood Executor I", color: "#E60000" },
  { name: "♣ Blood Executor II", color: "#CC0000" },
  { name: "♣ Blood Executor III", color: "#B30000" },

  { name: "♦ Vendetta Marshal I", color: "#990000" },
  { name: "♦ Vendetta Marshal II", color: "#800000" },
  { name: "♦ Vendetta Marshal III", color: "#660000" },

  { name: "♛ Crimson Regent I", color: "#4D0000" },
  { name: "♛ Crimson Regent II", color: "#330000" },
  { name: "♛ Crimson Regent III", color: "#1A0000" },

  { name: "♠ Obsidian Don", color: "#0D0000" },
  { name: "☠ Black Sovereign", color: "#010101" } // fixed visible black
];

/* ---------------- SLASH COMMANDS ---------------- */
const commands = [
  new SlashCommandBuilder().setName("setuproles").setDescription("Create all TSVM roles"),
  new SlashCommandBuilder().setName("eraseroles").setDescription("Delete all TSVM roles")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Slash commands registered");
  } catch (err) {
    console.error("Slash command error:", err);
  }
})();

/* ---------------- BOT READY ---------------- */
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

/* ---------------- INTERACTIONS ---------------- */
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const guild = interaction.guild;

    /* ---------- CREATE ROLES ---------- */
    if (interaction.commandName === "setuproles") {
      await interaction.reply("Creating TSVM roles…");

      for (const role of tsvmRoles) {
        const exists = guild.roles.cache.find(r => r.name === role.name);
        if (!exists) {
          await guild.roles.create({
            name: role.name,
            color: role.color,
            hoist: true,          // display separately
            reason: "TSVM Rank System"
          });
        }
      }

      await interaction.followUp("✅ TSVM roles created and ordered.");
    }

    /* ---------- DELETE ROLES ---------- */
    if (interaction.commandName === "eraseroles") {
      await interaction.reply("Removing TSVM roles…");

      for (const role of tsvmRoles) {
        const found = guild.roles.cache.find(r => r.name === role.name);
        if (found) await found.delete("TSVM reset");
      }

      await interaction.followUp("🗑️ All TSVM roles deleted.");
    }

  } catch (err) {
    console.error("Command error:", err);
    if (!interaction.replied) {
      await interaction.reply("❌ An error occurred.");
    }
  }
});

/* ---------------- LOGIN ---------------- */
client.login(TOKEN);
