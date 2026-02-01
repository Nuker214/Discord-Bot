import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } from "discord.js";

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ---------------- Rank base names ----------------
const rankBases = [
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

// ---------------- Bot ready ----------------
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ---------------- Build rank I/II/III role mentions ----------------
function getRoleMentions(guild, suffix) {
  const mentions = [];
  for (const base of rankBases) {
    const role = guild.roles.cache.find(r => r.name === `${base} ${suffix}`);
    if (role) mentions.push(`<@&${role.id}>`);
  }
  return mentions;
}

// ---------------- Slash commands ----------------
const commands = [
  new SlashCommandBuilder()
    .setName("sendembedrolelist")
    .setDescription("Sends three embeds listing all ranks I, II, III with mentions"),

  new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Explains what each rank means")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("Slash commands registered");
})();

// ---------------- Command handler ----------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const guild = interaction.guild;

  // ---------------- sendembedrolelist ----------------
  if (interaction.commandName === "sendembedrolelist") {
    await interaction.deferReply();

    const mentionsI = getRoleMentions(guild, "I");
    const mentionsII = getRoleMentions(guild, "II");
    const mentionsIII = getRoleMentions(guild, "III");

    const embedI = new EmbedBuilder()
      .setTitle("Rank Tier I")
      .setDescription(mentionsI.join(" "))
      .setColor(0x1abc9c);

    const embedII = new EmbedBuilder()
      .setTitle("Rank Tier II")
      .setDescription(mentionsII.join(" "))
      .setColor(0x3498db);

    const embedIII = new EmbedBuilder()
      .setTitle("Rank Tier III")
      .setDescription(mentionsIII.join(" "))
      .setColor(0xe91e63);

    await interaction.editReply({ embeds: [embedI, embedII, embedIII] });
  }

  // ---------------- roleinfo ----------------
  if (interaction.commandName === "roleinfo") {
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setTitle("FTAP Rank Progression")
      .setDescription("This explains what each rank tier represents in the FTAP system.")
      .addFields(
        {
          name: "Beginner Stage",
          value: "Observer → Initiate → Novitiate → Apprentice\nJust starting, learning basics, practicing techniques.",
          inline: false
        },
        {
          name: "Intermediate Stage",
          value: "Intermediate → Practitioner → Proficient → Advanced → Experienced\nGaining accuracy, skill, and reliability; able to mentor small groups.",
          inline: false
        },
        {
          name: "Master Stage",
          value: "Advanced Practitioner → Ascendant → Transcendent → Luminary → Primes → Eternals → Omniscient → Nexithal → Zethithal\nExceptional skill, leadership, recognized as top flingers.",
          inline: false
        }
      )
      .setColor(0x9b59b6);

    await interaction.editReply({ embeds: [embed] });
  }
});

client.login(TOKEN);
