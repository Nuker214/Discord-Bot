// ================================
// IMPORTS
// ================================
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType
} = require("discord.js");

// ================================
// CLIENT SETUP (RENDER SAFE)
// ================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ================================
// BOT READY (RENDER LOGGING)
// ================================
client.once("ready", () => {
  console.log("=================================");
  console.log(`🤖 Bot Online: ${client.user.tag}`);
  console.log(`🌍 Connected to ${client.guilds.cache.size} servers`);
  console.log("🚀 Running on Render");
  console.log("=================================");
});

// ================================
// WHEN BOT IS ADDED TO A SERVER
// ================================
client.on("guildCreate", async (guild) => {
  try {
    // Find a channel to send the setup message
    let channel =
      guild.systemChannel ||
      guild.channels.cache.find(
        c =>
          c.type === ChannelType.GuildText &&
          c.permissionsFor(guild.members.me).has(
            PermissionsBitField.Flags.SendMessages
          )
      );

    if (!channel) return;

    // ================================
    // MAIN SETUP EMBED (RED, DETAILED)
// ================================
    const setupEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("🛑 SYSTEM INITIALIZATION REQUIRED")
      .setDescription(
        "**Welcome.**\n\n" +
        "This server is not yet protected by the **System Framework**.\n\n" +
        "**Prefix:** `.`\n\n" +
        "🔐 The system will:\n" +
        "• Create secure roles\n" +
        "• Lock command permissions\n" +
        "• Build a private system category\n" +
        "• Enable authorization requests\n\n" +
        "⚠️ **Only one System Manager may exist.**\n\n" +
        "Click **Setup Now** to begin secure configuration."
      )
      .setFooter({
        text: "System Bot • Secure Server Framework"
      })
      .setTimestamp();

    // ================================
    // BUTTONS
    // ================================
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("system_setup_now")
        .setLabel("🛠 Setup Now")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("system_continue")
        .setLabel("Continue")
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      embeds: [setupEmbed],
      components: [buttons]
    });

  } catch (err) {
    console.error("❌ Error during guildCreate:", err);
  }
});

// ================================
// BUTTON INTERACTIONS
// ================================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // ================================
  // CONTINUE (DOES NOTHING)
// ================================
  if (interaction.customId === "system_continue") {
    return interaction.reply({
      content: "➡️ Setup skipped. You may configure the system later.",
      ephemeral: true
    });
  }

  // ================================
  // SETUP NOW
// ================================
  if (interaction.customId === "system_setup_now") {
    const guild = interaction.guild;
    const member = interaction.member;

    // Admin check
    if (
      !member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return interaction.reply({
        content: "❌ Only server administrators can initialize the system.",
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // ================================
      // CREATE SYSTEM MANAGER ROLE
// ================================
      const systemManagerRole = await guild.roles.create({
        name: "System Manager",
        color: 0xff0000,
        permissions: [],
        hoist: true,
        mentionable: false,
        reason: "System initialization"
      });

      await member.roles.add(systemManagerRole);

      // ================================
      // CREATE SYSTEM CATEGORY (PRIVATE)
// ================================
      const systemCategory = await guild.channels.create({
        name: "🔒 SYSTEM",
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: systemManagerRole.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }
        ]
      });

      // ================================
      // SYSTEM CHANNEL LIST (10 CHANNELS)
// ================================
      const systemChannels = [
        "📛-bot-errors",
        "📜-system-logs",
        "📊-statistics",
        "⏱️-uptime",
        "🔍-audit-log",
        "⚙️-config",
        "🚨-alerts",
        "🧪-debug",
        "🛡️-security",
        "📁-reports"
      ];

      for (const name of systemChannels) {
        await guild.channels.create({
          name,
          type: ChannelType.GuildText,
          parent: systemCategory.id
        });
      }

      // ================================
      // SUCCESS MESSAGE
// ================================
      await interaction.editReply(
        "✅ **System initialized successfully.**\n\n" +
        "You are now the **System Manager**.\n" +
        "All system channels have been secured."
      );

    } catch (error) {
      console.error("❌ Setup failed:", error);
      await interaction.editReply(
        "❌ Setup failed. Check bot permissions and try again."
      );
    }
  }
});

// ================================
// LOGIN (RENDER ENV TOKEN)
// ================================
client.login(process.env.TOKEN);
