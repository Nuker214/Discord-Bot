const {
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

/* =========================
   CONFIRMATION HELPER
========================= */
async function confirm(message, title, description) {
  const embed = new EmbedBuilder()
    .setColor(0xffa500)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: "System Framework • Confirmation" });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("✅ Confirm")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("❌ Cancel")
      .setStyle(ButtonStyle.Secondary)
  );

  const msg = await message.channel.send({ embeds: [embed], components: [row] });

  try {
    const i = await msg.awaitMessageComponent({
      filter: i => i.user.id === message.author.id,
      time: 15000
    });

    await msg.delete().catch(() => {});
    return i.customId === "confirm";
  } catch {
    await msg.delete().catch(() => {});
    return false;
  }
}

module.exports = async (client, message) => {
  if (!message.content.startsWith(".") || message.author.bot) return;

  const args = message.content.slice(1).split(/ +/);
  const cmd = args.shift().toLowerCase();

  const manager = message.guild.roles.cache.find(r => r.name === "System Manager");
  const assistant = message.guild.roles.cache.find(r => r.name === "System Assistant");

  const isManager = manager && message.member.roles.cache.has(manager.id);
  const isAssistant = assistant && message.member.roles.cache.has(assistant.id);

  /* =========================
     PING
  ========================= */
  if (cmd === "ping") {
    return message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle("🏓 Pong")
          .setDescription(`Latency: **${client.ws.ping}ms**`)
      ]
    });
  }

  /* =========================
     NUKE (MANAGER ONLY)
  ========================= */
  if (cmd === "nuke") {
    if (!isManager) return;

    const ok = await confirm(
      message,
      "☢️ SERVER NUKE",
      "This will **delete all channels and roles**.\nThis action is irreversible."
    );
    if (!ok) return;

    message.guild.channels.cache.forEach(c => c.deletable && c.delete().catch(() => {}));
    message.guild.roles.cache.forEach(r => r.name !== "@everyone" && r.editable && r.delete().catch(() => {}));
  }

  /* =========================
     KICK / BAN
  ========================= */
  if (cmd === "kick" || cmd === "ban") {
    if (!isManager && !isAssistant) return;
    if (cmd === "ban" && !isManager) return;

    const member = message.mentions.members.first();
    if (!member) return;

    const ok = await confirm(
      message,
      cmd === "kick" ? "👢 Kick User" : "🔨 Ban User",
      `Target: **${member.user.tag}**`
    );
    if (!ok) return;

    cmd === "kick" ? member.kick() : member.ban();
  }

  /* =========================
     MUTE
  ========================= */
  if (cmd === "mute") {
    if (!isManager && !isAssistant) return;

    const member = message.mentions.members.first();
    if (!member) return;

    let role = message.guild.roles.cache.find(r => r.name === "System Muted");
    if (!role) {
      role = await message.guild.roles.create({ name: "System Muted", color: "Grey" });
      message.guild.channels.cache.forEach(c => {
        c.permissionOverwrites.create(role, { SendMessages: false, Speak: false }).catch(() => {});
      });
    }

    const ok = await confirm(
      message,
      "🔇 Mute User",
      `Target: **${member.user.tag}**`
    );
    if (!ok) return;

    member.roles.add(role);
  }

  /* =========================
     SLOWMODE
  ========================= */
  if (cmd === "slowmode") {
    if (!isManager && !isAssistant) return;
    const seconds = parseInt(args[0]);
    if (isNaN(seconds)) return;

    const ok = await confirm(
      message,
      "🐌 Enable Slow Mode",
      `Delay: **${seconds}s**`
    );
    if (!ok) return;

    message.channel.setRateLimitPerUser(seconds);
  }

  if (cmd === "slowmodeoff") {
    if (!isManager && !isAssistant) return;
    const ok = await confirm(message, "🐇 Disable Slow Mode", "Remove slow mode?");
    if (!ok) return;
    message.channel.setRateLimitPerUser(0);
  }

  /* =========================
     LOCK / UNLOCK
  ========================= */
  if (cmd === "lock" || cmd === "unlock") {
    if (!isManager && !isAssistant) return;

    const ok = await confirm(
      message,
      cmd === "lock" ? "🔒 Lock Channel" : "🔓 Unlock Channel",
      `Channel: ${message.channel}`
    );
    if (!ok) return;

    message.channel.permissionOverwrites.edit(message.guild.id, {
      SendMessages: cmd === "lock" ? false : null
    });
  }

  /* =========================
     PURGE
  ========================= */
  if (cmd === "purge") {
    if (!isManager && !isAssistant) return;
    const amount = parseInt(args[0]);
    if (!amount || amount > 100) return;

    const ok = await confirm(
      message,
      "🧹 Purge Messages",
      `Delete **${amount} messages**?`
    );
    if (!ok) return;

    message.channel.bulkDelete(amount, true);
  }

  /* =========================
     INSPECT (DETAILED)
  ========================= */
  if (cmd === "inspect") {
    const member = message.mentions.members.first() || message.member;

    const embed = new EmbedBuilder()
      .setColor(0x00ffff)
      .setTitle("🧠 USER INSPECTION")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User", value: `${member.user.tag}\nID: ${member.id}` },
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` },
        { name: "Joined Server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` },
        {
          name: "Roles",
          value: member.roles.cache.filter(r => r.name !== "@everyone").map(r => r.name).join(", ") || "None"
        },
        {
          name: "Permissions",
          value: member.permissions.toArray().join(", ")
        }
      )
      .setFooter({ text: "System Framework • Intelligence" });

    message.channel.send({ embeds: [embed] });
  }
};
