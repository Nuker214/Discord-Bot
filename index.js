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
    /* ---------- CREATE ROLES ---------- */
    if (interaction.commandName === "setuproles") {
      await interaction.reply("Creating TSVM roles…");

      for (const role of tsvmRoles) {
        const exists = interaction.guild.roles.cache.find(r => r.name === role.name);
        if (!exists) {
          await interaction.guild.roles.create({
            name: role.name,
            color: role.color,
            reason: "TSVM Rank System"
          });
        }
      }

      await interaction.followUp("TSVM roles created and ordered.");
    }

    /* ---------- DELETE ROLES ---------- */
    if (interaction.commandName === "eraseroles") {
      await interaction.reply("Removing TSVM roles…");

      for (const role of tsvmRoles) {
        const found = interaction.guild.roles.cache.find(r => r.name === role.name);
        if (found) await found.delete("TSVM reset");
      }

      await interaction.followUp("All TSVM roles deleted.");
    }

  } catch (err) {
    console.error("Command error:", err);
    if (!interaction.replied) {
      await interaction.reply("An error occurred.");
    }
  }
});

/* ---------------- LOGIN ---------------- */
client.login(TOKEN);
