const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const express = require("express");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const app = express();
app.get("/", (req, res) => res.send("Rank Bot is running"));
app.listen(3000);

// ---------------- TIERS ----------------
const tiers = [
  "Observer",
  "Initiate",
  "Novitiate",
  "Apprentice",
  "Intermediate",
  "Practitioner",
  "Proficient",
  "Advanced",
  "Experienced",
  "Advanced Practitioner",
  "Ascendant",
  "Transcendent",
  "Luminary",
  "Ascendant Prime",
  "Transcendent Prime",
  "Luminary Prime",
  "Luminary Eternal",
  "Ascendant Eternal",
  "Transcendent Eternal",
  "Omniscient",
  "Nexithal",
  "Zethithal"
];

// Build I / II / III
const ranks = [];
for (const tier of tiers) {
  ranks.push(`${tier} I`);
  ranks.push(`${tier} II`);
  ranks.push(`${tier} III`);
}

// ---------------- SLASH COMMAND ----------------
const commands = [
  new SlashCommandBuilder()
    .setName("setupranks")
    .setDescription("Create all Nexithal ranks with gradient")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("Slash commands registered");
})();

// ---------------- COLOR GRADIENT ----------------
function gradientColor(index, total) {
  const start = [90, 60, 255];   // deep blue
  const end = [255, 80, 200];    // pink-magenta

  const t = index / (total - 1);

  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);

  return (r << 16) + (g << 8) + b;
}

// ---------------- BOT READY ----------------
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ---------------- COMMAND ----------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "setupranks") return;

  const guild = interaction.guild;
  await interaction.reply("Creating Nexithal rank hierarchy…");

  for (let i = 0; i < ranks.length; i++) {
    const name = ranks[i];
    const color = gradientColor(i, ranks.length);

    const exists = guild.roles.cache.find(r => r.name === name);
    if (!exists) {
      await guild.roles.create({
        name,
        color,
        hoist: true,
        reason: "Nexithal Rank System"
      });
    }
  }

  await interaction.followUp("All Nexithal ranks created with full gradient.");
});

// ---------------- LOGIN ----------------
client.login(TOKEN);
