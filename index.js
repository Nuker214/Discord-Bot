// index.js
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const express = require("express");

// --- Environment variables ---
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("Missing required environment variables: TOKEN, CLIENT_ID, or GUILD_ID");
  process.exit(1);
}

// --- Discord client ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
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

// --- Express server to keep bot alive on Render ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("TSVM bot is alive."));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// --- Register slash command ---
const commands = [
  new SlashCommandBuilder()
    .setName("rolecreate")
    .setDescription("Creates the full TSVM hierarchy")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Slash commands registered successfully ✅");
  } catch (err) {
    console.error("Error registering slash commands:", err);
  }
})();

// --- Ready event ---
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag} ✅`);
});

// --- Slash command handler ---
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "rolecreate") {
    try {
      await interaction.reply("Starting TSVM role creation... this may take a moment.");

      const guild = interaction.guild;
      if (!guild) return await interaction.editReply("Bot is not in a server.");

      for (const [name, color] of ranks.reverse()) {
        await guild.roles.create({
          name,
          color,
          hoist: true,
          reason: "TSVM Black Ledger hierarchy"
        });
      }

      await interaction.editReply("All TSVM roles have been created successfully ✅");
    } catch (err) {
      console.error("Error creating roles:", err);
      await interaction.editReply("Failed to create roles. Check bot permissions and role hierarchy.");
    }
  }
});

// --- Login with error handling ---
client.login(TOKEN)
  .then(() => console.log("Bot successfully logged in!"))
  .catch(err => console.error("Failed to login:", err));
