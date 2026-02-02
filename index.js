const { Client, GatewayIntentBits, Collection, EmbedBuilder, PermissionsBitField, ChannelType, REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

// Bot setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Configuration
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;

// Storage
let welcomeChannelId = null;
let leaveChannelId = null;

// Command prefix
const prefix = '.';

// Ranking roles
const RANKING_ROLES = [
    "Observer I", "Observer II", "Observer III",
    "Initiate I", "Initiate II", "Initiate III",
    "Novitiate I", "Novitiate II", "Novitiate III",
    "Apprentice I", "Apprentice II", "Apprentice III",
    "Intermediate I", "Intermediate II", "Intermediate III",
    "Practitioner I", "Practitioner II", "Practitioner III",
    "Proficient I", "Proficient II", "Proficient III",
    "Advanced I", "Advanced II", "Advanced III",
    "Experienced I", "Experienced II", "Experienced III",
    "Advanced Practitioner I", "Advanced Practitioner II", "Advanced Practitioner III",
    "Ascendant I", "Ascendant II", "Ascendant III",
    "Transcendent I", "Transcendent II", "Transcendent III",
    "Luminary I", "Luminary II", "Luminary III",
    "Ascendant Prime I", "Ascendant Prime II", "Ascendant Prime III",
    "Transcendent Prime I", "Transcendent Prime II", "Transcendent Prime III",
    "Luminary Prime I", "Luminary Prime II", "Luminary Prime III",
    "Luminary Eternal I", "Luminary Eternal II", "Luminary Eternal III",
    "Ascendant Eternal I", "Ascendant Eternal II", "Ascendant Eternal III",
    "Transcendent Eternal I", "Transcendent Eternal II", "Transcendent Eternal III",
    "Omniscient I", "Omniscient II", "Omniscient III",
    "Nexithal I", "Nexithal II", "Nexithal III",
    "Zethithal I", "Zethithal II", "Zethithal III"
];

// Channel structure
const CHANNEL_STRUCTURE = [
    {
        name: "📁 0. Uncategorized",
        channels: [
            "📝 verification-request",
            "⏳ waiting-lounge", 
            "✅ agreement-verification"
        ]
    },
    {
        name: "🎉 1. Welcome & Info",
        channels: [
            "👋 welcome-chat",
            "👋 leave-chat",
            "📢 announcements",
            "📜 rules",
            "🏰 clan-info",
            "🏆 achievements",
            "📅 events",
            "📚 resources"
        ]
    },
    {
        name: "🔧 2. Misc",
        channels: [
            "👥 role-list",
            "ℹ️ role-information",
            "🎯 target-list",
            "🤝 clan-allies",
            "🌐 clan-allies-servers",
            "⚔️ clan-wars"
        ]
    },
    {
        name: "💬 3. Lounge",
        channels: [
            "💭 general-chat",
            "🎮 game-chat",
            "🖼️ media",
            "🎵 music",
            "🗣️ off-topic",
            "🔊 voice-chat"
        ]
    },
    {
        name: "🤝 4. Clan Allies",
        channels: [
            "💬 allies-chat",
            "🖼️ allies-media",
            "📜 treaties",
            "💡 alliance-ideas",
            "📝 alliance-notes",
            "💬 discussion"
        ]
    },
    {
        name: "🎓 5. Training",
        channels: [
            "📈 progress",
            "👨‍🏫 mentor-chat",
            "🖼️ mentors-media",
            "💡 tips",
            "⚔️ strategies",
            "📊 tracking",
            "🔄 practice-sessions",
            "📝 feedback"
        ]
    },
    {
        name: "📋 6. Evaluation",
        channels: [
            "📄 evaluation-template",
            "📊 evaluations-results",
            "🔄 retake-evaluation",
            "📝 evaluation-request",
            "🔒 private-servers"
        ]
    }
];

// Role categories
const ROLE_CATEGORIES = [
    {
        name: "Partial Access",
        color: "Blue",
        roles: [
            { name: "Partial Access Members", color: "#3498db" },
            { name: "Partial Access Allies", color: "#3498db" },
            { name: "Partial Access Training", color: "#3498db" },
            { name: "Partial Access Misc", color: "#3498db" },
            { name: "Partial Access Information", color: "#3498db" }
        ]
    },
    {
        name: "Access Roles",
        color: "Green",
        roles: [
            { name: "Members", color: "#2ecc71" },
            { name: "Allies", color: "#2ecc71" },
            { name: "Rank Evaluators", color: "#27ae60" },
            { name: "Rank Approvals", color: "#27ae60" },
            { name: "Training Access", color: "#2ecc71" },
            { name: "Allies Access", color: "#2ecc71" },
            { name: "Misc Access", color: "#2ecc71" },
            { name: "Information Access", color: "#2ecc71" },
            { name: "Announcements Access", color: "#2ecc71" },
            { name: "Events Access", color: "#2ecc71" },
            { name: "Target List Access", color: "#2ecc71" }
        ]
    },
    {
        name: "Status Roles",
        color: "Purple",
        roles: [
            { name: "Enemies", color: "#e74c3c" },
            { name: "Traitor", color: "#c0392b" },
            { name: "Trusted", color: "#9b59b6" },
            { name: "Friends", color: "#9b59b6" },
            { name: "Emojis Permissions", color: "#f1c40f" },
            { name: "Stickers Permissions", color: "#f1c40f" },
            { name: "Gifs Permissions", color: "#f1c40f" },
            { name: "Image Permissions", color: "#f1c40f" },
            { name: "Slowmode Bypass", color: "#f1c40f" }
        ]
    },
    {
        name: "Leadership",
        color: "Red",
        roles: [
            { name: "Leader", color: "#e74c3c" },
            { name: "Leader Assistant", color: "#c0392b" },
            { name: "Council Leader", color: "#c0392b" },
            { name: "Council Assistant", color: "#c0392b" },
            { name: "Council Of Security", color: "#c0392b" },
            { name: "Council Of Strategy", color: "#c0392b" },
            { name: "Council Of Training", color: "#c0392b" },
            { name: "Council Of Creation", color: "#c0392b" },
            { name: "Right Hand", color: "#c0392b" },
            { name: "Left Hand", color: "#c0392b" },
            { name: "Messager", color: "#c0392b" }
        ]
    },
    {
        name: "Special",
        color: "Orange",
        roles: [
            { name: "Bots", color: "#7f8c8d" },
            { name: "Scripter", color: "#e67e22" },
            { name: "Coder", color: "#e67e22" },
            { name: "Evaluation Access", color: "#e67e22" }
        ]
    },
    {
        name: "Verification",
        color: "Blurple",
        roles: [
            { name: "Evaluation Needed", color: "#f1c40f" },
            { name: "Verification Needed", color: "#f1c40f" },
            { name: "Agreement Needed", color: "#f1c40f" },
            { name: "Verification Accepted", color: "#2ecc71" },
            { name: "Agreement Accepted", color: "#2ecc71" },
            { name: "Agreement Denied", color: "#e74c3c" },
            { name: "Been Evaluated", color: "#3498db" },
            { name: "Accepted", color: "#2ecc71" },
            { name: "Access Removed", color: "#c0392b" }
        ]
    }
];

// Register slash commands
async function registerSlashCommands() {
    const commands = [
        {
            name: 'rolelist',
            description: 'Send embed with all ranking roles'
        },
        {
            name: 'roleinfo',
            description: 'Display ranking information'
        },
        {
            name: 'claninfo',
            description: 'Display clan information'
        },
        {
            name: 'rules',
            description: 'Display server rules'
        },
        {
            name: 'kick',
            description: 'Kick a member',
            options: [
                {
                    name: 'member',
                    description: 'Member to kick',
                    type: 6,
                    required: true
                },
                {
                    name: 'reason',
                    description: 'Reason for kicking',
                    type: 3,
                    required: false
                }
            ]
        },
        {
            name: 'ban',
            description: 'Ban a member',
            options: [
                {
                    name: 'member',
                    description: 'Member to ban',
                    type: 6,
                    required: true
                },
                {
                    name: 'reason',
                    description: 'Reason for banning',
                    type: 3,
                    required: false
                }
            ]
        },
        {
            name: 'mute',
            description: 'Mute a member',
            options: [
                {
                    name: 'member',
                    description: 'Member to mute',
                    type: 6,
                    required: true
                },
                {
                    name: 'reason',
                    description: 'Reason for muting',
                    type: 3,
                    required: false
                }
            ]
        }
    ];

    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );
        console.log('Slash commands registered!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

// Event: Bot ready
client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);
    await registerSlashCommands();
});

// Event: Member join
client.on('guildMemberAdd', async (member) => {
    if (welcomeChannelId) {
        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle("🎉 Welcome to the Server!")
                .setDescription(`Welcome ${member} to our community!`)
                .setColor(0x00FF00)
                .addFields(
                    { name: "Important Info", value: "Please check the rules and verification channels to get started." }
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            await channel.send({ content: `${member}`, embeds: [embed] });
        }
    }
});

// Event: Member leave
client.on('guildMemberRemove', async (member) => {
    if (leaveChannelId) {
        const channel = member.guild.channels.cache.get(leaveChannelId);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle("👋 Goodbye!")
                .setDescription(`${member.user.tag} has left the server.`)
                .setColor(0xFF0000)
                .addFields(
                    { name: "We'll miss you!", value: "Hope to see you again soon!" }
                )
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        }
    }
});

// Message commands handler
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // COMMAND 1: .rolelistembed
    if (command === 'rolelistembed') {
        const guild = message.guild;
        const rankingMentions = [];
        
        for (const roleName of RANKING_ROLES) {
            const role = guild.roles.cache.find(r => r.name === roleName);
            if (role) rankingMentions.push(role.toString());
        }

        const embed = new EmbedBuilder()
            .setTitle("📊 Ranking Roles List")
            .setDescription("Here are all the ranking roles in the server:")
            .setColor(0x3498db);

        const chunks = [];
        for (let i = 0; i < rankingMentions.length; i += 20) {
            chunks.push(rankingMentions.slice(i, i + 20));
        }

        chunks.forEach((chunk, index) => {
            embed.addFields({
                name: `Rankings Part ${index + 1}`,
                value: chunk.join('\n') || "No roles found",
                inline: false
            });
        });

        const pingRoles = guild.roles.cache.filter(r => RANKING_ROLES.includes(r.name)).first(5);
        await message.channel.send({ 
            content: pingRoles.map(r => r.toString()).join(' '),
            embeds: [embed] 
        });
    }

    // COMMAND 2: .roleinfoembed
    else if (command === 'roleinfoembed') {
        const embed = new EmbedBuilder()
            .setTitle("ℹ️ Role Information")
            .setDescription("Explanation of all ranking levels:")
            .setColor(0x2ecc71)
            .addFields(
                { name: "Observer I-III", value: "Beginner levels - Learning the basics", inline: false },
                { name: "Initiate I-III", value: "Starting to participate actively", inline: false },
                { name: "Novitiate I-III", value: "Developing fundamental skills", inline: false },
                { name: "Apprentice I-III", value: "Under guidance, building competence", inline: false },
                { name: "Intermediate I-III", value: "Solid foundation, consistent performance", inline: false },
                { name: "Practitioner I-III", value: "Applying skills effectively", inline: false },
                { name: "Proficient I-III", value: "Highly skilled, reliable performer", inline: false },
                { name: "Advanced I-III", value: "Expert level with deep knowledge", inline: false },
                { name: "Experienced I-III", value: "Seasoned veteran with extensive experience", inline: false },
                { name: "Advanced Practitioner I-III", value: "Mastering complex techniques", inline: false },
                { name: "Ascendant I-III", value: "Rising to elite status", inline: false },
                { name: "Transcendent I-III", value: "Beyond conventional mastery", inline: false },
                { name: "Luminary I-III", value: "Guiding light for others", inline: false },
                { name: "Prime Levels", value: "Peak performance in each tier", inline: false },
                { name: "Eternal Levels", value: "Legendary status, enduring excellence", inline: false },
                { name: "Omniscient/Nexithal/Zethithal", value: "Ultimate mastery and leadership", inline: false }
            );

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 3: .claninfoembed
    else if (command === 'claninfoembed') {
        const embed = new EmbedBuilder()
            .setTitle("🏰 Clan Information")
            .setDescription("Welcome to our community!")
            .setColor(0xf1c40f)
            .addFields(
                { name: "Who We Are", value: "We are a dedicated group of individuals focused on growth, teamwork, and excellence. Our community values respect, collaboration, and continuous improvement.", inline: false },
                { name: "Our Mission", value: "To create a supportive environment where members can develop their skills, form lasting connections, and achieve their goals together.", inline: false },
                { name: "Community Values", value: "• Respect for all members\n• Teamwork and collaboration\n• Continuous learning\n• Positive attitude\n• Active participation", inline: false },
                { name: "How to Get Started", value: "1. Read the rules in #rules\n2. Complete verification in #verification-request\n3. Agree to our community guidelines\n4. Start participating in discussions and events!", inline: false }
            )
            .setFooter({ text: "We're glad to have you here!" });

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 4: .Enablewelcomechat
    else if (command === 'enablewelcomechat') {
        welcomeChannelId = message.channel.id;
        const embed = new EmbedBuilder()
            .setTitle("✅ Welcome Chat Enabled")
            .setDescription(`Welcome messages will now be sent to ${message.channel}`)
            .setColor(0x00FF00)
            .addFields(
                { name: "How it works", value: "Whenever a new member joins the server, they will be pinged with a welcome message here.", inline: false }
            );

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 5: .Enableleavechat
    else if (command === 'enableleavechat') {
        leaveChannelId = message.channel.id;
        const embed = new EmbedBuilder()
            .setTitle("✅ Leave Chat Enabled")
            .setDescription(`Leave notifications will now be sent to ${message.channel}`)
            .setColor(0xFFFF00)
            .addFields(
                { name: "How it works", value: "Whenever a member leaves the server, a goodbye message will be sent here.", inline: false }
            );

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 6: .Disablewelcomechat
    else if (command === 'disablewelcomechat') {
        welcomeChannelId = null;
        const embed = new EmbedBuilder()
            .setTitle("❌ Welcome Chat Disabled")
            .setDescription("Welcome messages have been disabled.")
            .setColor(0xFF0000);

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 7: .Disableleavechat
    else if (command === 'disableleavechat') {
        leaveChannelId = null;
        const embed = new EmbedBuilder()
            .setTitle("❌ Leave Chat Disabled")
            .setDescription("Leave notifications have been disabled.")
            .setColor(0xFF0000);

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 8: .Rulesembed
    else if (command === 'rulesembed') {
        const embed = new EmbedBuilder()
            .setTitle("📜 Server Rules")
            .setDescription("Please read and follow these rules to maintain a positive community:")
            .setColor(0xFF0000)
            .addFields(
                { name: "Rule 1: Respect", value: "Treat all members with respect. No harassment, hate speech, or discrimination.", inline: false },
                { name: "Rule 2: No Spamming", value: "Do not spam channels with excessive messages, mentions, or content.", inline: false },
                { name: "Rule 3: Appropriate Content", value: "Keep all content appropriate for all ages. No NSFW content.", inline: false },
                { name: "Rule 4: No Advertising", value: "No unsolicited advertising or self-promotion without permission.", inline: false },
                { name: "Rule 5: Follow Discord TOS", value: "You must follow Discord's Terms of Service at all times.", inline: false },
                { name: "Rule 6: Use Proper Channels", value: "Post content in the appropriate channels only.", inline: false },
                { name: "Rule 7: Listen to Staff", value: "Follow instructions from staff members and moderators.", inline: false },
                { name: "Rule 8: No Drama", value: "Keep personal conflicts out of the server. Handle issues privately.", inline: false },
                { name: "Rule 9: English Only", value: "Use English in public channels for moderation purposes.", inline: false },
                { name: "Rule 10: Have Fun!", value: "This is a community - be friendly and enjoy your time here!", inline: false }
            )
            .setFooter({ text: "Violation of these rules may result in warnings, mutes, or bans." });

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 9: .Deleterankings
    else if (command === 'deleterankings') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("You need administrator permissions to use this command.");
        }

        const guild = message.guild;
        let deleted = 0;

        for (const roleName of RANKING_ROLES) {
            const role = guild.roles.cache.find(r => r.name === roleName);
            if (role) {
                try {
                    await role.delete();
                    deleted++;
                } catch (error) {
                    console.error(`Failed to delete role ${roleName}:`, error);
                }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("🗑️ Ranking Roles Deleted")
            .setDescription(`Successfully deleted ${deleted} ranking roles.`)
            .setColor(0xFF0000);

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 10: .Setuprankings
    else if (command === 'setuprankings') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("You need administrator permissions to use this command.");
        }

        const guild = message.guild;
        let created = 0;
        const colors = [0x3498db, 0x2ecc71, 0x9b59b6]; // Blue, Green, Purple

        for (let i = 0; i < RANKING_ROLES.length; i++) {
            const roleName = RANKING_ROLES[i];
            if (!guild.roles.cache.find(r => r.name === roleName)) {
                try {
                    const color = colors[i % colors.length];
                    await guild.roles.create({
                        name: roleName,
                        color: color,
                        mentionable: true,
                        reason: 'Ranking role setup'
                    });
                    created++;
                } catch (error) {
                    console.error(`Failed to create role ${roleName}:`, error);
                }
            }
        }

        // Reorder roles
        const roles = guild.roles.cache.filter(r => RANKING_ROLES.includes(r.name));
        const sortedRoles = Array.from(roles.values()).sort((a, b) => {
            return RANKING_ROLES.indexOf(a.name) - RANKING_ROLES.indexOf(b.name);
        });

        // Try to reorder (Discord.js v14 doesn't have direct role position editing)
        // Roles are automatically ordered by creation time

        const embed = new EmbedBuilder()
            .setTitle("✅ Ranking Roles Created")
            .setDescription(`Successfully created ${created} ranking roles.`)
            .setColor(0x00FF00);

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 11: .Rolemake
    else if (command === 'rolemake') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("You need administrator permissions to use this command.");
        }

        const guild = message.guild;
        let created = 0;
        let existing = 0;

        for (const category of ROLE_CATEGORIES) {
            for (const roleData of category.roles) {
                if (guild.roles.cache.find(r => r.name === roleData.name)) {
                    existing++;
                    continue;
                }

                try {
                    await guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        mentionable: true,
                        reason: 'Role setup'
                    });
                    created++;
                } catch (error) {
                    console.error(`Failed to create role ${roleData.name}:`, error);
                }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ Roles Created")
            .setDescription(`Created ${created} new roles. ${existing} roles already existed.`)
            .setColor(0x00FF00);

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 12: .Deleteroles
    else if (command === 'deleteroles') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("You need administrator permissions to use this command.");
        }

        const guild = message.guild;
        let deleted = 0;

        for (const role of guild.roles.cache.values()) {
            if (role.name !== '@everyone' && !role.managed && role.editable) {
                try {
                    await role.delete();
                    deleted++;
                } catch (error) {
                    console.error(`Failed to delete role ${role.name}:`, error);
                }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("🗑️ Roles Deleted")
            .setDescription(`Successfully deleted ${deleted} roles.`)
            .setColor(0xFF0000);

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 13: .Kick
    else if (command === 'kick') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply("You don't have permission to kick members!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a member to kick.");

        const reason = args.slice(1).join(' ') || "No reason provided";

        try {
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setTitle("👢 Member Kicked")
                .setDescription(`${member} has been kicked.`)
                .setColor(0xFFA500)
                .addFields(
                    { name: "Reason", value: reason, inline: false },
                    { name: "Moderator", value: message.author.toString(), inline: false }
                );

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            await message.reply(`Failed to kick member: ${error.message}`);
        }
    }

    // COMMAND 14: .ban
    else if (command === 'ban') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("You don't have permission to ban members!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a member to ban.");

        const reason = args.slice(1).join(' ') || "No reason provided";

        try {
            await member.ban({ reason });
            const embed = new EmbedBuilder()
                .setTitle("🔨 Member Banned")
                .setDescription(`${member} has been banned.`)
                .setColor(0xFF0000)
                .addFields(
                    { name: "Reason", value: reason, inline: false },
                    { name: "Moderator", value: message.author.toString(), inline: false }
                );

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            await message.reply(`Failed to ban member: ${error.message}`);
        }
    }

    // COMMAND 15: .mute
    else if (command === 'mute') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("You don't have permission to mute members!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a member to mute.");

        const reason = args.slice(1).join(' ') || "No reason provided";
        const guild = message.guild;

        // Create or get muted role
        let mutedRole = guild.roles.cache.find(r => r.name === "Muted");
        if (!mutedRole) {
            try {
                mutedRole = await guild.roles.create({
                    name: "Muted",
                    color: "#95a5a6",
                    permissions: [],
                    reason: 'Muted role for moderation'
                });

                // Set permissions for all channels
                for (const channel of guild.channels.cache.values()) {
                    await channel.permissionOverwrites.create(mutedRole, {
                        SendMessages: false,
                        Speak: false,
                        AddReactions: false
                    });
                }
            } catch (error) {
                return message.reply(`Failed to create muted role: ${error.message}`);
            }
        }

        try {
            await member.roles.add(mutedRole);
            const embed = new EmbedBuilder()
                .setTitle("🔇 Member Muted")
                .setDescription(`${member} has been muted.`)
                .setColor(0x95a5a6)
                .addFields(
                    { name: "Reason", value: reason, inline: false },
                    { name: "Moderator", value: message.author.toString(), inline: false }
                );

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            await message.reply(`Failed to mute member: ${error.message}`);
        }
    }

    // COMMAND 16: .channelsmake
    else if (command === 'channelsmake') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("You need administrator permissions to use this command.");
        }

        const guild = message.guild;
        let created = 0;

        for (const categoryData of CHANNEL_STRUCTURE) {
            // Create category
            const category = await guild.channels.create({
                name: categoryData.name,
                type: ChannelType.GuildCategory
            });

            // Create channels in category
            for (const channelName of categoryData.channels) {
                try {
                    const isVoice = channelName.includes('voice-chat') || channelName.includes('🔊');
                    if (isVoice) {
                        await guild.channels.create({
                            name: channelName,
                            type: ChannelType.GuildVoice,
                            parent: category.id
                        });
                    } else {
                        await guild.channels.create({
                            name: channelName,
                            type: ChannelType.GuildText,
                            parent: category.id
                        });
                    }
                    created++;
                } catch (error) {
                    console.error(`Failed to create channel ${channelName}:`, error);
                }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ Channels Created")
            .setDescription(`Successfully created all channels and categories.`)
            .setColor(0x00FF00);

        await message.channel.send({ embeds: [embed] });
    }

    // COMMAND 17: .channelsdelete
    else if (command === 'channelsdelete') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("You need administrator permissions to use this command.");
        }

        const guild = message.guild;
        let deleted = 0;

        for (const channel of guild.channels.cache.values()) {
            if (channel.id !== message.channel.id && channel.deletable) {
                try {
                    await channel.delete();
                    deleted++;
                } catch (error) {
                    console.error(`Failed to delete channel ${channel.name}:`, error);
                }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("🗑️ Channels Deleted")
            .setDescription(`Successfully deleted ${deleted} channels.`)
            .setColor(0xFF0000);

        await message.channel.send({ embeds: [embed] });
    }

    // VERIFICATION COMMANDS

    // .Verify
    else if (command === 'verify') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("You don't have permission to verify members!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a member to verify.");

        const verificationNeeded = message.guild.roles.cache.find(r => r.name === "Verification Needed");
        const verificationAccepted = message.guild.roles.cache.find(r => r.name === "Verification Accepted");
        const partialMember = message.guild.roles.cache.find(r => r.name === "Partial Access Members");

        if (verificationNeeded && member.roles.cache.has(verificationNeeded.id)) {
            await member.roles.remove(verificationNeeded);
        }

        if (verificationAccepted) {
            await member.roles.add(verificationAccepted);
        }

        if (partialMember) {
            await member.roles.add(partialMember);
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ Member Verified")
            .setDescription(`${member} has been verified and given partial access.`)
            .setColor(0x00FF00);

        await message.channel.send({ embeds: [embed] });
    }

    // .Unverify
    else if (command === 'unverify') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("You don't have permission to unverify members!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a member to unverify.");

        const verificationAccepted = message.guild.roles.cache.find(r => r.name === "Verification Accepted");
        const partialMember = message.guild.roles.cache.find(r => r.name === "Partial Access Members");
        const verificationNeeded = message.guild.roles.cache.find(r => r.name === "Verification Needed");

        if (verificationAccepted && member.roles.cache.has(verificationAccepted.id)) {
            await member.roles.remove(verificationAccepted);
        }

        if (partialMember && member.roles.cache.has(partialMember.id)) {
            await member.roles.remove(partialMember);
        }

        if (verificationNeeded) {
            await member.roles.add(verificationNeeded);
        }

        const embed = new EmbedBuilder()
            .setTitle("🔄 Member Unverified")
            .setDescription(`${member} has been unverified.`)
            .setColor(0xFFFF00);

        await message.channel.send({ embeds: [embed] });
    }

    // .CheckAgreement
    else if (command === 'checkagreement') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("You don't have permission to check agreements!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a member to check.");

        const agreementNeeded = message.guild.roles.cache.find(r => r.name === "Agreement Needed");
        const agreementAccepted = message.guild.roles.cache.find(r => r.name === "Agreement Accepted");
        const agreementDenied = message.guild.roles.cache.find(r => r.name === "Agreement Denied");

        let status = "Unknown";
        if (agreementNeeded && member.roles.cache.has(agreementNeeded.id)) {
            status = "Agreement Needed";
        } else if (agreementAccepted && member.roles.cache.has(agreementAccepted.id)) {
            status = "Agreement Accepted";
        } else if (agreementDenied && member.roles.cache.has(agreementDenied.id)) {
            status = "Agreement Denied";
        }

        const embed = new EmbedBuilder()
            .setTitle("📋 Agreement Status")
            .setDescription(`${member}'s agreement status: **${status}**`)
            .setColor(0x3498db);

        await message.channel.send({ embeds: [embed] });
    }

    // .AllowAgreement
    else if (command === 'allowagreement') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("You don't have permission to accept agreements!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a member.");

        const agreementNeeded = message.guild.roles.cache.find(r => r.name === "Agreement Needed");
        const agreementAccepted = message.guild.roles.cache.find(r => r.name === "Agreement Accepted");
        const acceptedRole = message.guild.roles.cache.find(r => r.name === "Accepted");

        if (agreementNeeded && member.roles.cache.has(agreementNeeded.id)) {
            await member.roles.remove(agreementNeeded);
        }

        if (agreementAccepted) {
            await member.roles.add(agreementAccepted);
        }

        if (acceptedRole) {
            await member.roles.add(acceptedRole);
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ Agreement Accepted")
            .setDescription(`${member}'s agreement has been accepted.`)
            .setColor(0x00FF00);

        await message.channel.send({ embeds: [embed] });
    }

    // .AllowAccess
    else if (command === 'allowaccess') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("You don't have permission to grant access!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a member to grant access to.");

        const accessRoles = [
            "Members",
            "Training Access",
            "Misc Access",
            "Evaluation Access",
            "Information Access"
        ];

        const rolesToAdd = [];
        for (const roleName of accessRoles) {
            const role = message.guild.roles.cache.find(r => r.name === roleName);
            if (role) rolesToAdd.push(role);
        }

        if (rolesToAdd.length > 0) {
            await member.roles.add(rolesToAdd);
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ Full Access Granted")
            .setDescription(`${member} has been granted full access to the server.`)
            .setColor(0x00FF00);

        await message.channel.send({ embeds: [embed] });
    }

    // .RemoveAccess
    else if (command === 'removeaccess') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("You don't have permission to remove access!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a member to remove access from.");

        const accessRemovedRole = message.guild.roles.cache.find(r => r.name === "Access Removed");
        
        // Remove all roles except @everyone
        const rolesToRemove = member.roles.cache.filter(role => role.name !== '@everyone');
        
        if (rolesToRemove.size > 0) {
            await member.roles.remove(rolesToRemove);
        }

        if (accessRemovedRole) {
            await member.roles.add(accessRemovedRole);
        }

        const embed = new EmbedBuilder()
            .setTitle("🚫 Access Removed")
            .setDescription(`All roles removed from ${member} and Access Removed role assigned.`)
            .setColor(0xFF0000);

        await message.channel.send({ embeds: [embed] });
    }
});

// Slash commands handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'rolelist') {
        const guild = interaction.guild;
        const rankingMentions = [];
        
        for (const roleName of RANKING_ROLES) {
            const role = guild.roles.cache.find(r => r.name === roleName);
            if (role) rankingMentions.push(role.toString());
        }

        const embed = new EmbedBuilder()
            .setTitle("📊 Ranking Roles List")
            .setDescription("Here are all the ranking roles in the server:")
            .setColor(0x3498db);

        const chunks = [];
        for (let i = 0; i < rankingMentions.length; i += 20) {
            chunks.push(rankingMentions.slice(i, i + 20));
        }

        chunks.forEach((chunk, index) => {
            embed.addFields({
                name: `Rankings Part ${index + 1}`,
                value: chunk.join('\n') || "No roles found",
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'roleinfo') {
        const embed = new EmbedBuilder()
            .setTitle("ℹ️ Role Information")
            .setDescription("Explanation of all ranking levels:")
            .setColor(0x2ecc71)
            .addFields(
                { name: "Observer I-III", value: "Beginner levels - Learning the basics", inline: false },
                { name: "Initiate I-III", value: "Starting to participate actively", inline: false },
                { name: "Novitiate I-III", value: "Developing fundamental skills", inline: false },
                { name: "Apprentice I-III", value: "Under guidance, building competence", inline: false },
                { name: "Intermediate I-III", value: "Solid foundation, consistent performance", inline: false },
                { name: "Practitioner I-III", value: "Applying skills effectively", inline: false },
                { name: "Proficient I-III", value: "Highly skilled, reliable performer", inline: false },
                { name: "Advanced I-III", value: "Expert level with deep knowledge", inline: false },
                { name: "Experienced I-III", value: "Seasoned veteran with extensive experience", inline: false },
                { name: "Advanced Practitioner I-III", value: "Mastering complex techniques", inline: false },
                { name: "Ascendant I-III", value: "Rising to elite status", inline: false },
                { name: "Transcendent I-III", value: "Beyond conventional mastery", inline: false },
                { name: "Luminary I-III", value: "Guiding light for others", inline: false },
                { name: "Prime Levels", value: "Peak performance in each tier", inline: false },
                { name: "Eternal Levels", value: "Legendary status, enduring excellence", inline: false },
                { name: "Omniscient/Nexithal/Zethithal", value: "Ultimate mastery and leadership", inline: false }
            );

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'claninfo') {
        const embed = new EmbedBuilder()
            .setTitle("🏰 Clan Information")
            .setDescription("Welcome to our community!")
            .setColor(0xf1c40f)
            .addFields(
                { name: "Who We Are", value: "We are a dedicated group of individuals focused on growth, teamwork, and excellence. Our community values respect, collaboration, and continuous improvement.", inline: false },
                { name: "Our Mission", value: "To create a supportive environment where members can develop their skills, form lasting connections, and achieve their goals together.", inline: false },
                { name: "Community Values", value: "• Respect for all members\n• Teamwork and collaboration\n• Continuous learning\n• Positive attitude\n• Active participation", inline: false },
                { name: "How to Get Started", value: "1. Read the rules in #rules\n2. Complete verification in #verification-request\n3. Agree to our community guidelines\n4. Start participating in discussions and events!", inline: false }
            );

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'rules') {
        const embed = new EmbedBuilder()
            .setTitle("📜 Server Rules")
            .setDescription("Please read and follow these rules to maintain a positive community:")
            .setColor(0xFF0000)
            .addFields(
                { name: "Rule 1: Respect", value: "Treat all members with respect. No harassment, hate speech, or discrimination.", inline: false },
                { name: "Rule 2: No Spamming", value: "Do not spam channels with excessive messages, mentions, or content.", inline: false },
                { name: "Rule 3: Appropriate Content", value: "Keep all content appropriate for all ages. No NSFW content.", inline: false },
                { name: "Rule 4: No Advertising", value: "No unsolicited advertising or self-promotion without permission.", inline: false },
                { name: "Rule 5: Follow Discord TOS", value: "You must follow Discord's Terms of Service at all times.", inline: false },
                { name: "Rule 6: Use Proper Channels", value: "Post content in the appropriate channels only.", inline: false },
                { name: "Rule 7: Listen to Staff", value: "Follow instructions from staff members and moderators.", inline: false },
                { name: "Rule 8: No Drama", value: "Keep personal conflicts out of the server. Handle issues privately.", inline: false },
                { name: "Rule 9: English Only", value: "Use English in public channels for moderation purposes.", inline: false },
                { name: "Rule 10: Have Fun!", value: "This is a community - be friendly and enjoy your time here!", inline: false }
            );

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'kick') {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: "You don't have permission to kick members!", ephemeral: true });
        }

        const member = options.getMember('member');
        const reason = options.getString('reason') || "No reason provided";

        try {
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setTitle("👢 Member Kicked")
                .setDescription(`${member} has been kicked.`)
                .setColor(0xFFA500)
                .addFields(
                    { name: "Reason", value: reason, inline: false },
                    { name: "Moderator", value: interaction.user.toString(), inline: false }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `Failed to kick member: ${error.message}`, ephemeral: true });
        }
    }

    else if (commandName === 'ban') {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You don't have permission to ban members!", ephemeral: true });
        }

        const member = options.getMember('member');
        const reason = options.getString('reason') || "No reason provided";

        try {
            await member.ban({ reason });
            const embed = new EmbedBuilder()
                .setTitle("🔨 Member Banned")
                .setDescription(`${member} has been banned.`)
                .setColor(0xFF0000)
                .addFields(
                    { name: "Reason", value: reason, inline: false },
                    { name: "Moderator", value: interaction.user.toString(), inline: false }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `Failed to ban member: ${error.message}`, ephemeral: true });
        }
    }

    else if (commandName === 'mute') {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "You don't have permission to mute members!", ephemeral: true });
        }

        const member = options.getMember('member');
        const reason = options.getString('reason') || "No reason provided";
        const guild = interaction.guild;

        let mutedRole = guild.roles.cache.find(r => r.name === "Muted");
        if (!mutedRole) {
            try {
                mutedRole = await guild.roles.create({
                    name: "Muted",
                    color: "#95a5a6",
                    permissions: [],
                    reason: 'Muted role for moderation'
                });
            } catch (error) {
                return interaction.reply({ content: `Failed to create muted role: ${error.message}`, ephemeral: true });
            }
        }

        try {
            await member.roles.add(mutedRole);
            const embed = new EmbedBuilder()
                .setTitle("🔇 Member Muted")
                .setDescription(`${member} has been muted.`)
                .setColor(0x95a5a6)
                .addFields(
                    { name: "Reason", value: reason, inline: false },
                    { name: "Moderator", value: interaction.user.toString(), inline: false }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `Failed to mute member: ${error.message}`, ephemeral: true });
        }
    }
});

// Error handling
client.on('error', console.error);

// Login
client.login(TOKEN);
