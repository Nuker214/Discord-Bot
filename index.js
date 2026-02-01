// index.js
// Discord.js v14 Ranking Bot with /ranking setup and gradient-style embeds

import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// ENV VARIABLES (set these in Render)
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// BOT CLIENT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ROLE TIERS (WITH I / II / III)
const RANKS = [
  "Observer I","Observer II","Observer III",
  "Initiate I","Initiate II","Initiate III",
  "Novitiate I","Novitiate II","Novitiate III",
  "Apprentice I","Apprentice II","Apprentice III",
  "Intermediate I","Intermediate II","Intermediate III",
  "Practitioner I","Practitioner II","Practitioner III",
  "Proficient I","Proficient II","Proficient III",
  "Advanced I","Advanced II","Advanced III",
  "Experienced I","Experienced II","Experienced III",
  "Advanced Practitioner I","Advanced Practitioner II","Advanced Practitioner III",
  "Ascendant I","Ascendant II","Ascendant III",
  "Transcendent I","Transcendent II","Transcendent III",
  "Luminary I","Luminary II","Luminary III",
  "Ascendant Prime I","Ascendant Prime II","Ascendant Prime III",
  "Transcendent Prime I","Transcendent Prime II","Transcendent Prime III",
  "Luminary Prime I","Luminary Prime II","Luminary Prime III",
  "Luminary Eternal I","Luminary Eternal II","Luminary Eternal III",
  "Ascendant Eternal I","Ascendant Eternal II","Ascendant Eternal III",
  "Transcendent Eternal I","Transcendent Eternal II","Transcendent Eternal III",
  "Omniscient I","Omniscient II","Omniscient III",
  "Nexithal I","Nexithal II","Nexithal III",
  "Zethithal I","Zethithal II","Zethithal III"
];

// SLASH COMMAND
const commands = [
  new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Ranking system commands')
    .addSubcommand(sub =>
      sub
        .setName('setup')
        .setDescription('Create all ranking roles')
    )
    .addSubcommand(sub =>
      sub
        .setName('set')
        .setDescription('Set a user rank')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to rank')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('rank')
            .setDescription('Rank name')
            .setRequired(true)
            .addChoices(...RANKS.map(r => ({ name: r, value: r })))
        )
    )
].map(cmd => cmd.toJSON());

// REGISTER COMMANDS
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('Commands registered.');
  } catch (err) {
    console.error(err);
  }
})();

// READY EVENT
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// COLOR GRADIENT GENERATOR
function generateGradient(stops, steps) {
  const result = [];

  const segments = stops.length - 1;
  const stepsPerSegment = Math.floor(steps / segments);

  for (let s = 0; s < segments; s++) {
    const [r1, g1, b1] = stops[s];
    const [r2, g2, b2] = stops[s + 1];

    for (let i = 0; i < stepsPerSegment; i++) {
      const t = i / stepsPerSegment;

      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);

      result.push((r << 16) + (g << 8) + b);
    }
  }

  // Fill remaining if needed
  while (result.length < steps) {
    const [r, g, b] = stops[stops.length - 1];
    result.push((r << 16) + (g << 8) + b);
  }

  return result;
}

// INTERACTIONS
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName !== 'ranking') return;

  // PERMISSION CHECK
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({
      content: '❌ You need Administrator permission.',
      ephemeral: true
    });
  }

  const sub = interaction.options.getSubcommand();

  // /ranking setup
  if (sub === 'setup') {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;

    let created = 0;

    // Smooth Red → Orange → Yellow gradient (generated)
    const gradientColors = generateGradient([
      [255, 26, 26],   // Red
      [255, 140, 0],   // Orange
      [255, 215, 0]    // Yellow
    ], RANKS.length);

    let i = 0;

    for (const rank of RANKS) {
      let role = guild.roles.cache.find(r => r.name === rank);

      if (!role) {
        await guild.roles.create({
          name: rank,
          color: gradientColors[i],
          reason: 'Ranking System Setup'
        });

        created++;
      }

      i++;
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Ranking Setup Complete')
      .setDescription(`Created **${created}** roles with red → orange → yellow fade.`)
      .setColor(0xff8c00)
      .setFooter({ text: 'Ranking System' });

    return interaction.editReply({ embeds: [embed] });
  }

  // /ranking set
  if (sub === 'set') {
    const user = interaction.options.getUser('user');
    const rank = interaction.options.getString('rank');

    const member = await interaction.guild.members.fetch(user.id);

    // KEEP OLD RANKS (Do NOT remove previous ranks)
    // No rank removal is performed


    // ADD NEW RANK
    const role = interaction.guild.roles.cache.find(r => r.name === rank);

    if (!role) {
      return interaction.reply({
        content: '❌ Role not found. Run /ranking setup first.',
        ephemeral: true
      });
    }

    await member.roles.add(role);

    const embed = new EmbedBuilder()
      .setTitle('🏆 Rank Updated')
      .setDescription(`**${user.tag}** is now **${rank}**`)
      .setColor(0xffd700) // Yellow-Gold // Pink-purple gradient look
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: 'Ranking System' });

    return interaction.reply({ embeds: [embed] });
  }
});

// LOGIN
client.login(TOKEN);

/*
========================
HOW TO USE ON RENDER
========================

1. Install deps:
   npm install discord.js dotenv

2. Add ENV vars in Render:
   TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   GUILD_ID=your_server_id

3. Start command:
   node index.js

4. In Discord:
   /ranking setup   -> creates roles
   /ranking set     -> assigns rank

========================
*/
