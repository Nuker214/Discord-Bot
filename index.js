const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  PermissionsBitField 
} = require("discord.js");
const express = require("express");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/* ---------------- WEB SERVER ---------------- */
const app = express();
app.get("/", (req, res) => res.send("TSVM Bot is alive."));
app.listen(3000, () => console.log("Web server active"));

/* ---------------- CHANNEL DATA ---------------- */
// Fancy Unicode font function
const fancyFont = text => text.split("").map(c => {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D400 + (code - 65)); // A-Z
  if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + (code - 97)); // a-z
  return c;
}).join("");

// Each category has 12 channels (text or voice)
const categories = [
  {
    name: fancyFont("📢 Welcome & Info"),
    channels: [
      "📢 announcements","📜 rules","📝 clan-info","💡 faq","🎖️ achievements",
      "📅 events","🆕 updates","🔗 resources","🗺️ map","📌 pinned","💬 welcome-chat","👋 introductions"
    ],
    textOnly: true
  },
  {
    name: fancyFont("💬 Clan Chat"),
    channels: [
      "💬 general-chat","🎮 game-chat","🗡️ strategy","📸 media","🎶 music",
      "🎲 events","💭 ideas","🧩 misc","🔊 general-voice","🗣️ raid-voice","🎤 training-voice","🎧 chill-voice"
    ]
  },
  {
    name: fancyFont("⚔️ Operations"),
    channels: [
      "⚔️ operations","📊 reports","🎯 objectives","🗂️ archives","📝 notes",
      "💡 tactics","📌 reminders","🔍 intel","👑 command","🗣️ coordination","🎤 briefing","🎧 lounge"
    ]
  },
  {
    name: fancyFont("📘 Training"),
    channels: [
      "📘 training","🏅 progress","🤝 mentor-chat","📝 exercises","💡 tips",
      "🗂️ manuals","📊 tracking","🎯 challenges","🗣️ training-voice","🎤 coaching","🎧 study","🔊 practice-voice"
    ]
  },
  {
    name: fancyFont("🤝 Clan Allies"),
    channels: [
      "🤝 allies-chat","📜 treaties","🎯 joint-strategy","📊 shared-reports","💡 alliance-ideas",
      "📝 alliance-notes","📸 allies-media","🎲 joint-events","🔗 links","📌 pinned",
      "🗣️ allies-voice","🎤 alliance-lounge"
    ]
  },
  {
    name: fancyFont("⚔️ Clan Wars"),
    channels: [
      "⚔️ war-chat","🎯 war-objectives","📊 war-reports","📝 war-strategy","💡 war-ideas",
      "📌 war-pins","📸 war-media","🗂️ war-archives","🗣️ war-voice","🎤 command-voice","🎧 war-lounge","🔊 general-war"
    ]
  }
];

/* ---------------- SLASH COMMANDS ---------------- */
const commands = [
  new SlashCommandBuilder().setName("setupserver").setDescription("Create all TSVM server categories & channels"),
  new SlashCommandBuilder().setName("resetserver").setDescription("Delete all TSVM server categories & channels")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log("Slash commands registered");
  } catch (err) { console.error(err); }
})();

/* ---------------- BOT READY ---------------- */
client.once("ready", () => console.log(`Logged in as ${client.user.tag}`));

/* ---------------- INTERACTIONS ---------------- */
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === "setupserver") {
      await interaction.reply("Creating TSVM server structure…");
      
      for (const cat of categories) {
        // Check if category exists
        let category = interaction.guild.channels.cache.find(c => c.name === cat.name && c.type === 4);
        if (!category) {
          category = await interaction.guild.channels.create({
            name: cat.name,
            type: 4, // Category
          });
        }

        for (const chName of cat.channels) {
          const fancyName = fancyFont(chName);
          let type = cat.textOnly || chName.includes("voice") ? 2 : 0; // 2=text, 0=voice
          // Create channel under category
          if (!interaction.guild.channels.cache.find(c => c.name === fancyName)) {
            await interaction.guild.channels.create({
              name: fancyName,
              type: type,
              parent: category.id
            });
          }
        }
      }

      await interaction.followUp("All categories and channels created!");
    }

    if (interaction.commandName === "resetserver") {
      await interaction.reply("Deleting TSVM categories…");
      for (const cat of categories) {
        const category = interaction.guild.channels.cache.find(c => c.name === cat.name && c.type === 4);
        if (category) await category.delete("TSVM reset");
      }
      await interaction.followUp("All TSVM categories deleted!");
    }

  } catch (err) {
    console.error("Command error:", err);
    if (!interaction.replied) await interaction.reply("An error occurred.");
  }
});

/* ---------------- LOGIN ---------------- */
client.login(TOKEN);
