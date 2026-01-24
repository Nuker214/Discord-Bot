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

const commandHandler = require("./commands");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log("=================================");
  console.log(`🤖 Logged in as ${client.user.tag}`);
  console.log("🚀 Running on Render");
  console.log("=================================");
});

/* =========================
   BOT JOIN SETUP MESSAGE
========================= */
client.on("guildCreate", async (guild) => {
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

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle("🛑 SYSTEM INITIALIZATION")
    .setDescription(
      "**Prefix:** `.`\n\n" +
      "This server is not secured.\n\n" +
      "🔐 Setup will:\n" +
      "• Create System roles\n" +
      "• Lock permissions\n" +
      "• Build private System category\n" +
      "• Enable authorization framework\n\n" +
      "Only an **Administrator** may proceed."
    )
    .setFooter({ text: "System Framework" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("setup_now")
      .setLabel("🛠 Setup Now")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("setup_skip")
      .setLabel("Continue")
      .setStyle(ButtonStyle.Secondary)
  );

  channel.send({ embeds: [embed], components: [row] });
});

/* =========================
   SETUP BUTTON HANDLER
========================= */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "setup_skip") {
    return interaction.reply({ content: "Setup skipped.", ephemeral: true });
  }

  if (interaction.customId === "setup_now") {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        content: "❌ Admins only.",
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;

    const managerRole = await guild.roles.create({
      name: "System Manager",
      color: "Red",
      hoist: true
    });

    await interaction.member.roles.add(managerRole);

    const category = await guild.channels.create({
      name: "🔒 SYSTEM",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: managerRole.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    const channels = [
      "bot-errors",
      "system-logs",
      "statistics",
      "uptime",
      "audit-log",
      "alerts",
      "security",
      "debug",
      "reports",
      "config"
    ];

    for (const name of channels) {
      await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        parent: category
      });
    }

    interaction.editReply("✅ System successfully initialized.");
  }
});

/* =========================
   COMMAND HANDLER
========================= */
client.on("messageCreate", async (message) => {
  commandHandler(client, message);
});

client.login(process.env.TOKEN);
