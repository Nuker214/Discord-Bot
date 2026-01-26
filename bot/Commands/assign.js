module.exports = async (client, message, args) => {

  if (!message.member.roles.cache.some(r => r.name === "System Manager"))
    return message.reply("❌ Only System Managers can do this.");

  const user = message.mentions.members.first();

  if (!user) return message.reply("Mention a user.");

  const role = message.guild.roles.cache.find(
    r => r.name === "System Assistant"
  );

  await user.roles.add(role);

  message.channel.send(
    `✅ ${user.user.tag} is now a System Assistant.`
  );
};
