require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

/* ========== BOT READY ========== */

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* ========== WHEN BOT JOINS SERVER ========== */

client.on(Events.GuildCreate, async (guild) => {
  try {
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle("🤖 System Setup")
      .setDescription(
        `Welcome! Thank you for adding **${client.user.username}**.\n\nPlease choose how you'd like to proceed:`
      )
      .setColor("Blue")
      .setFooter({ text: "System Configuration" })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("start_setup")
        .setLabel("Start Setup")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("ignore_setup")
        .setLabel("Ignore Setup")
        .setStyle(ButtonStyle.Danger)
    );

    owner.send({
      embeds: [embed],
      components: [buttons]
    });

  } catch (err) {
    console.log("❌ Could not DM server owner:", err);
  }
});

/* ========== BUTTON HANDLER ========== */

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const guild = interaction.guild;
  const member = interaction.member;

  /* START SETUP */
  if (interaction.customId === "start_setup") {

    await interaction.deferReply({ ephemeral: true });

    /* CREATE ROLES */

    const managerRole = await guild.roles.create({
      name: "System Manager",
      color: "Red",
      permissions: [PermissionsBitField.Flags.Administrator]
    });

    const assistantRole = await guild.roles.create({
      name: "System Assistant",
      color: "Orange"
    });

    /* ASSIGN MANAGER */

    await member.roles.add(managerRole);

    /* CREATE CATEGORY */

    const category = await guild.channels.create({
      name: "BOT STATISTICS",
      type: 4,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: managerRole.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: assistantRole.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    /* CHANNELS */

    const channels = [
      "bot-warnings",
      "bot-errors",
      "render-console",
      "github-updates",
      "uptime-log",
      "render-errors",
      "self-assign-attempts",
      "command-errors"
    ];

    for (const name of channels) {
      await guild.channels.create({
        name,
        type: 0,
        parent: category.id
      });
    }

    await interaction.editReply(
      "✅ Setup completed successfully!"
    );
  }

  /* IGNORE SETUP */

  if (interaction.customId === "ignore_setup") {
    await interaction.reply({
      content: "⚠️ Setup skipped. You can run `.setup` later.",
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
