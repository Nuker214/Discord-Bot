const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ChannelType, REST, Routes, Collection } = require('discord.js');

// GET TOKEN FROM RENDER ENVIRONMENT
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;

// BOT SETUP
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// GLOBAL STORAGE
let welcomeChannel = null;
let leaveChannel = null;
const prefix = '.';

// RANKING ROLES
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

// CHANNEL STRUCTURE
const CHANNELS = [
    { name: "📁 0. Uncategorized", channels: [
        "📝 verification-request", "⏳ waiting-lounge", "✅ agreement-verification"
    ]},
    { name: "🎉 1. Welcome & Info", channels: [
        "👋 welcome-chat", "👋 leave-chat", "📢 announcements", "📜 rules",
        "🏰 clan-info", "🏆 achievements", "📅 events", "📚 resources"
    ]},
    { name: "🔧 2. Misc", channels: [
        "👥 role-list", "ℹ️ role-information", "🎯 target-list", "🤝 clan-allies",
        "🌐 clan-allies-servers", "⚔️ clan-wars"
    ]},
    { name: "💬 3. Lounge", channels: [
        "💭 general-chat", "🎮 game-chat", "🖼️ media", "🎵 music",
        "🗣️ off-topic", "🔊 voice-chat"
    ]},
    { name: "🤝 4. Clan Allies", channels: [
        "💬 allies-chat", "🖼️ allies-media", "📜 treaties", "💡 alliance-ideas",
        "📝 alliance-notes", "💬 discussion"
    ]},
    { name: "🎓 5. Training", channels: [
        "📈 progress", "👨‍🏫 mentor-chat", "🖼️ mentors-media", "💡 tips",
        "⚔️ strategies", "📊 tracking", "🔄 practice-sessions", "📝 feedback"
    ]},
    { name: "📋 6. Evaluation", channels: [
        "📄 evaluation-template", "📊 evaluations-results", "🔄 retake-evaluation",
        "📝 evaluation-request", "🔒 private-servers"
    ]}
];

// ALL ROLES TO CREATE
const ALL_ROLES = [
    // Partial Access
    { name: "Partial Access Members", color: "#3498db" },
    { name: "Partial Access Allies", color: "#3498db" },
    { name: "Partial Access Training", color: "#3498db" },
    { name: "Partial Access Misc", color: "#3498db" },
    { name: "Partial Access Information", color: "#3498db" },
    
    // Access Roles
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
    { name: "Target List Access", color: "#2ecc71" },
    
    // Status Roles
    { name: "Enemies", color: "#e74c3c" },
    { name: "Traitor", color: "#c0392b" },
    { name: "Trusted", color: "#9b59b6" },
    { name: "Friends", color: "#9b59b6" },
    { name: "Emojis Permissions", color: "#f1c40f" },
    { name: "Stickers Permissions", color: "#f1c40f" },
    { name: "Gifs Permissions", color: "#f1c40f" },
    { name: "Image Permissions", color: "#f1c40f" },
    { name: "Slowmode Bypass", color: "#f1c40f" },
    
    // Leadership
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
    { name: "Messager", color: "#c0392b" },
    
    // Special
    { name: "Bots", color: "#7f8c8d" },
    { name: "Scripter", color: "#e67e22" },
    { name: "Coder", color: "#e67e22" },
    { name: "Evaluation Access", color: "#e67e22" },
    
    // Verification
    { name: "Evaluation Needed", color: "#f1c40f" },
    { name: "Verification Needed", color: "#f1c40f" },
    { name: "Agreement Needed", color: "#f1c40f" },
    { name: "Verification Accepted", color: "#2ecc71" },
    { name: "Agreement Accepted", color: "#2ecc71" },
    { name: "Agreement Denied", color: "#e74c3c" },
    { name: "Been Evaluated", color: "#3498db" },
    { name: "Accepted", color: "#2ecc71" },
    { name: "Access Removed", color: "#c0392b" }
];

// BOT READY EVENT
client.once('ready', async () => {
    console.log(`✅ Bot Online: ${client.user.tag}`);
    console.log(`📊 Servers: ${client.guilds.cache.size}`);
    
    // Set bot status
    client.user.setActivity(`${prefix}help`, { type: 'LISTENING' });
    
    // Register slash commands
    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        const commands = [
            { name: 'rolelist', description: 'Show ranking roles' },
            { name: 'roleinfo', description: 'Show role information' },
            { name: 'claninfo', description: 'Show clan information' },
            { name: 'rules', description: 'Show server rules' },
            { name: 'kick', description: 'Kick a member', options: [
                { name: 'member', description: 'Member to kick', type: 6, required: true },
                { name: 'reason', description: 'Reason for kick', type: 3, required: false }
            ]},
            { name: 'ban', description: 'Ban a member', options: [
                { name: 'member', description: 'Member to ban', type: 6, required: true },
                { name: 'reason', description: 'Reason for ban', type: 3, required: false }
            ]},
            { name: 'mute', description: 'Mute a member', options: [
                { name: 'member', description: 'Member to mute', type: 6, required: true },
                { name: 'reason', description: 'Reason for mute', type: 3, required: false }
            ]}
        ];
        
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('✅ Slash commands registered');
    } catch (err) {
        console.log('⚠️ Could not register slash commands:', err.message);
    }
});

// WELCOME EVENT
client.on('guildMemberAdd', async member => {
    if (welcomeChannel) {
        const channel = await client.channels.fetch(welcomeChannel).catch(() => null);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('🎉 Welcome to the Server!')
                .setDescription(`Welcome ${member} to our community!`)
                .setColor(0x00FF00)
                .addFields({ name: 'Important Info', value: 'Check rules and verification channels to get started.' })
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
            await channel.send({ content: `${member}`, embeds: [embed] });
        }
    }
});

// LEAVE EVENT
client.on('guildMemberRemove', async member => {
    if (leaveChannel) {
        const channel = await client.channels.fetch(leaveChannel).catch(() => null);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('👋 Goodbye!')
                .setDescription(`${member.user.tag} has left.`)
                .setColor(0xFF0000)
                .addFields({ name: 'We\'ll miss you!', value: 'Hope to see you again!' })
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        }
    }
});

// PREFIX COMMANDS HANDLER
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const guild = message.guild;
    
    // COMMAND 1: .rolelistembed
    if (command === 'rolelistembed') {
        const roles = guild.roles.cache.filter(r => RANKING_ROLES.includes(r.name));
        const embed = new EmbedBuilder()
            .setTitle('📊 Ranking Roles List')
            .setDescription('All ranking roles:')
            .setColor(0x3498db);
        
        const roleList = roles.map(r => r.toString()).join('\n') || 'No ranking roles found';
        embed.addFields({ name: 'Roles', value: roleList.substring(0, 1024) });
        
        const pingRoles = roles.first(5).map(r => r.toString()).join(' ');
        await message.channel.send({ content: pingRoles || '', embeds: [embed] });
    }
    
    // COMMAND 2: .roleinfoembed
    if (command === 'roleinfoembed') {
        const embed = new EmbedBuilder()
            .setTitle('ℹ️ Role Information')
            .setDescription('Ranking system explanation:')
            .setColor(0x2ecc71)
            .addFields(
                { name: 'Observer to Apprentice', value: 'Beginner to intermediate levels', inline: false },
                { name: 'Intermediate to Proficient', value: 'Developing solid skills', inline: false },
                { name: 'Advanced to Experienced', value: 'Expert level with deep knowledge', inline: false },
                { name: 'Advanced Practitioner to Luminary', value: 'Mastering complex techniques', inline: false },
                { name: 'Prime Levels', value: 'Peak performance in each tier', inline: false },
                { name: 'Eternal Levels', value: 'Legendary status', inline: false },
                { name: 'Omniscient/Zethithal', value: 'Ultimate mastery and leadership', inline: false }
            );
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 3: .claninfoembed
    if (command === 'claninfoembed') {
        const embed = new EmbedBuilder()
            .setTitle('🏰 Clan Information')
            .setDescription('Welcome to our community!')
            .setColor(0xf1c40f)
            .addFields(
                { name: 'Who We Are', value: 'Dedicated group focused on growth, teamwork, and excellence.', inline: false },
                { name: 'Our Mission', value: 'Create supportive environment for skill development and connections.', inline: false },
                { name: 'Community Values', value: 'Respect • Teamwork • Learning • Positive Attitude • Participation', inline: false },
                { name: 'Get Started', value: '1. Read #rules\n2. Complete verification\n3. Agree to guidelines\n4. Participate!', inline: false }
            );
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 4: .Enablewelcomechat
    if (command === 'enablewelcomechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need administrator permissions!');
        }
        welcomeChannel = message.channel.id;
        const embed = new EmbedBuilder()
            .setTitle('✅ Welcome Chat Enabled')
            .setDescription(`Welcome messages will be sent to ${message.channel}`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 5: .Enableleavechat
    if (command === 'enableleavechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need administrator permissions!');
        }
        leaveChannel = message.channel.id;
        const embed = new EmbedBuilder()
            .setTitle('✅ Leave Chat Enabled')
            .setDescription(`Leave messages will be sent to ${message.channel}`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 6: .Disablewelcomechat
    if (command === 'disablewelcomechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need administrator permissions!');
        }
        welcomeChannel = null;
        const embed = new EmbedBuilder()
            .setTitle('❌ Welcome Chat Disabled')
            .setDescription('Welcome messages disabled')
            .setColor(0xFF0000);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 7: .Disableleavechat
    if (command === 'disableleavechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need administrator permissions!');
        }
        leaveChannel = null;
        const embed = new EmbedBuilder()
            .setTitle('❌ Leave Chat Disabled')
            .setDescription('Leave messages disabled')
            .setColor(0xFF0000);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 8: .Rulesembed
    if (command === 'rulesembed') {
        const embed = new EmbedBuilder()
            .setTitle('📜 Server Rules')
            .setDescription('Follow these rules:')
            .setColor(0xFF0000)
            .addFields(
                { name: 'Rule 1: Respect', value: 'Treat all members with respect.', inline: false },
                { name: 'Rule 2: No Spamming', value: 'No excessive messages or mentions.', inline: false },
                { name: 'Rule 3: Appropriate Content', value: 'Keep content appropriate. No NSFW.', inline: false },
                { name: 'Rule 4: No Advertising', value: 'No unsolicited advertising.', inline: false },
                { name: 'Rule 5: Follow Discord TOS', value: 'Follow Discord Terms of Service.', inline: false },
                { name: 'Rule 6: Proper Channels', value: 'Post in correct channels.', inline: false },
                { name: 'Rule 7: Listen to Staff', value: 'Follow staff instructions.', inline: false },
                { name: 'Rule 8: No Drama', value: 'Keep conflicts private.', inline: false },
                { name: 'Rule 9: English Only', value: 'Use English in public channels.', inline: false },
                { name: 'Rule 10: Have Fun!', value: 'Be friendly and enjoy!', inline: false }
            );
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 9: .Deleterankings
    if (command === 'deleterankings') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need administrator permissions!');
        }
        let deleted = 0;
        for (const roleName of RANKING_ROLES) {
            const role = guild.roles.cache.find(r => r.name === roleName);
            if (role) {
                try {
                    await role.delete();
                    deleted++;
                } catch (err) {}
            }
        }
        const embed = new EmbedBuilder()
            .setTitle('🗑️ Ranking Roles Deleted')
            .setDescription(`Deleted ${deleted} ranking roles`)
            .setColor(0xFF0000);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 10: .Setuprankings
    if (command === 'setuprankings') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need administrator permissions!');
        }
        let created = 0;
        const colors = [0x3498db, 0x2ecc71, 0x9b59b6];
        for (let i = 0; i < RANKING_ROLES.length; i++) {
            const roleName = RANKING_ROLES[i];
            if (!guild.roles.cache.find(r => r.name === roleName)) {
                try {
                    await guild.roles.create({
                        name: roleName,
                        color: colors[i % colors.length],
                        mentionable: true,
                        reason: 'Ranking setup'
                    });
                    created++;
                } catch (err) {}
            }
        }
        const embed = new EmbedBuilder()
            .setTitle('✅ Ranking Roles Created')
            .setDescription(`Created ${created} ranking roles`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 11: .Rolemake
    if (command === 'rolemake') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need administrator permissions!');
        }
        let created = 0;
        for (const roleData of ALL_ROLES) {
            if (!guild.roles.cache.find(r => r.name === roleData.name)) {
                try {
                    await guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        mentionable: true,
                        reason: 'Role setup'
                    });
                    created++;
                } catch (err) {}
            }
        }
        const embed = new EmbedBuilder()
            .setTitle('✅ Roles Created')
            .setDescription(`Created ${created} roles`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 12: .Deleteroles
    if (command === 'deleteroles') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need administrator permissions!');
        }
        let deleted = 0;
        for (const role of guild.roles.cache.values()) {
            if (role.name !== '@everyone' && !role.managed && role.editable) {
                try {
                    await role.delete();
                    deleted++;
                } catch (err) {}
            }
        }
        const embed = new EmbedBuilder()
            .setTitle('🗑️ Roles Deleted')
            .setDescription(`Deleted ${deleted} roles`)
            .setColor(0xFF0000);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 13: .Kick
    if (command === 'kick') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply('❌ You need kick permissions!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member to kick!');
        const reason = args.slice(1).join(' ') || 'No reason provided';
        try {
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setTitle('👢 Member Kicked')
                .setDescription(`${member} was kicked`)
                .setColor(0xFFA500)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: message.author.toString(), inline: false }
                );
            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            message.reply(`❌ Failed to kick: ${err.message}`);
        }
    }
    
    // COMMAND 14: .ban
    if (command === 'ban') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ You need ban permissions!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member to ban!');
        const reason = args.slice(1).join(' ') || 'No reason provided';
        try {
            await member.ban({ reason });
            const embed = new EmbedBuilder()
                .setTitle('🔨 Member Banned')
                .setDescription(`${member} was banned`)
                .setColor(0xFF0000)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: message.author.toString(), inline: false }
                );
            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            message.reply(`❌ Failed to ban: ${err.message}`);
        }
    }
    
    // COMMAND 15: .mute
    if (command === 'mute') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ You need manage roles permission!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member to mute!');
        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        let muteRole = guild.roles.cache.find(r => r.name === 'Muted');
        if (!muteRole) {
            try {
                muteRole = await guild.roles.create({
                    name: 'Muted',
                    color: '#95a5a6',
                    permissions: [],
                    reason: 'Mute role'
                });
                for (const channel of guild.channels.cache.values()) {
                    try {
                        await channel.permissionOverwrites.create(muteRole, {
                            SendMessages: false,
                            Speak: false
                        });
                    } catch (err) {}
                }
            } catch (err) {
                return message.reply(`❌ Failed to create mute role: ${err.message}`);
            }
        }
        
        try {
            await member.roles.add(muteRole);
            const embed = new EmbedBuilder()
                .setTitle('🔇 Member Muted')
                .setDescription(`${member} was muted`)
                .setColor(0x95a5a6)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: message.author.toString(), inline: false }
                );
            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            message.reply(`❌ Failed to mute: ${err.message}`);
        }
    }
    
    // COMMAND 16: .channelsmake
    if (command === 'channelsmake') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need administrator permissions!');
        }
        let created = 0;
        for (const categoryData of CHANNELS) {
            try {
                const category = await guild.channels.create({
                    name: categoryData.name,
                    type: ChannelType.GuildCategory
                });
                for (const channelName of categoryData.channels) {
                    try {
                        if (channelName.includes('🔊') || channelName.includes('voice')) {
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
                    } catch (err) {}
                }
            } catch (err) {}
        }
        const embed = new EmbedBuilder()
            .setTitle('✅ Channels Created')
            .setDescription(`Created ${created} channels`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 17: .channelsdelete
    if (command === 'channelsdelete') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ You need administrator permissions!');
        }
        let deleted = 0;
        for (const channel of guild.channels.cache.values()) {
            if (channel.id !== message.channel.id && channel.deletable) {
                try {
                    await channel.delete();
                    deleted++;
                } catch (err) {}
            }
        }
        const embed = new EmbedBuilder()
            .setTitle('🗑️ Channels Deleted')
            .setDescription(`Deleted ${deleted} channels`)
            .setColor(0xFF0000);
        await message.channel.send({ embeds: [embed] });
    }
    
    // VERIFICATION COMMANDS
    
    // .Verify
    if (command === 'verify') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ You need manage roles permission!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member to verify!');
        
        const verificationNeeded = guild.roles.cache.find(r => r.name === 'Verification Needed');
        const verificationAccepted = guild.roles.cache.find(r => r.name === 'Verification Accepted');
        const partialMember = guild.roles.cache.find(r => r.name === 'Partial Access Members');
        
        if (verificationNeeded && member.roles.cache.has(verificationNeeded.id)) {
            await member.roles.remove(verificationNeeded);
        }
        if (verificationAccepted) await member.roles.add(verificationAccepted);
        if (partialMember) await member.roles.add(partialMember);
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Member Verified')
            .setDescription(`${member} verified with partial access`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // .Unverify
    if (command === 'unverify') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ You need manage roles permission!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member to unverify!');
        
        const verificationAccepted = guild.roles.cache.find(r => r.name === 'Verification Accepted');
        const partialMember = guild.roles.cache.find(r => r.name === 'Partial Access Members');
        const verificationNeeded = guild.roles.cache.find(r => r.name === 'Verification Needed');
        
        if (verificationAccepted && member.roles.cache.has(verificationAccepted.id)) {
            await member.roles.remove(verificationAccepted);
        }
        if (partialMember && member.roles.cache.has(partialMember.id)) {
            await member.roles.remove(partialMember);
        }
        if (verificationNeeded) await member.roles.add(verificationNeeded);
        
        const embed = new EmbedBuilder()
            .setTitle('🔄 Member Unverified')
            .setDescription(`${member} unverified`)
            .setColor(0xFFFF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // .CheckAgreement
    if (command === 'checkagreement') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ You need manage roles permission!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member to check!');
        
        const agreementNeeded = guild.roles.cache.find(r => r.name === 'Agreement Needed');
        const agreementAccepted = guild.roles.cache.find(r => r.name === 'Agreement Accepted');
        const agreementDenied = guild.roles.cache.find(r => r.name === 'Agreement Denied');
        
        let status = 'Unknown';
        if (agreementNeeded && member.roles.cache.has(agreementNeeded.id)) status = 'Agreement Needed';
        else if (agreementAccepted && member.roles.cache.has(agreementAccepted.id)) status = 'Agreement Accepted';
        else if (agreementDenied && member.roles.cache.has(agreementDenied.id)) status = 'Agreement Denied';
        
        const embed = new EmbedBuilder()
            .setTitle('📋 Agreement Status')
            .setDescription(`${member}'s status: **${status}**`)
            .setColor(0x3498db);
        await message.channel.send({ embeds: [embed] });
    }
    
    // .AllowAgreement
    if (command === 'allowagreement') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ You need manage roles permission!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        
        const agreementNeeded = guild.roles.cache.find(r => r.name === 'Agreement Needed');
        const agreementAccepted = guild.roles.cache.find(r => r.name === 'Agreement Accepted');
        const acceptedRole = guild.roles.cache.find(r => r.name === 'Accepted');
        
        if (agreementNeeded && member.roles.cache.has(agreementNeeded.id)) {
            await member.roles.remove(agreementNeeded);
        }
        if (agreementAccepted) await member.roles.add(agreementAccepted);
        if (acceptedRole) await member.roles.add(acceptedRole);
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Agreement Accepted')
            .setDescription(`${member}'s agreement accepted`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // .AllowAccess
    if (command === 'allowaccess') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ You need manage roles permission!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        
        const accessRoles = ['Members', 'Training Access', 'Misc Access', 'Evaluation Access', 'Information Access'];
        const rolesToAdd = [];
        for (const roleName of accessRoles) {
            const role = guild.roles.cache.find(r => r.name === roleName);
            if (role) rolesToAdd.push(role);
        }
        if (rolesToAdd.length > 0) {
            await member.roles.add(rolesToAdd);
        }
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Full Access Granted')
            .setDescription(`${member} granted full access`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // .RemoveAccess
    if (command === 'removeaccess') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ You need manage roles permission!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        
        const rolesToRemove = member.roles.cache.filter(r => r.name !== '@everyone');
        if (rolesToRemove.size > 0) {
            await member.roles.remove(rolesToRemove);
        }
        
        const accessRemoved = guild.roles.cache.find(r => r.name === 'Access Removed');
        if (accessRemoved) {
            await member.roles.add(accessRemoved);
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🚫 Access Removed')
            .setDescription(`${member}'s access removed`)
            .setColor(0xFF0000);
        await message.channel.send({ embeds: [embed] });
    }
});

// SLASH COMMANDS HANDLER
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    const { commandName, options } = interaction;
    const guild = interaction.guild;
    
    if (commandName === 'rolelist') {
        const roles = guild.roles.cache.filter(r => RANKING_ROLES.includes(r.name));
        const embed = new EmbedBuilder()
            .setTitle('📊 Ranking Roles')
            .setDescription('All ranking roles:')
            .setColor(0x3498db);
        
        const roleList = roles.map(r => r.toString()).join('\n') || 'No ranking roles';
        embed.addFields({ name: 'Roles', value: roleList.substring(0, 1024) });
        await interaction.reply({ embeds: [embed] });
    }
    
    if (commandName === 'roleinfo') {
        const embed = new EmbedBuilder()
            .setTitle('ℹ️ Role Information')
            .setDescription('Ranking system explanation')
            .setColor(0x2ecc71)
            .addFields(
                { name: 'Beginner Levels', value: 'Observer to Apprentice', inline: false },
                { name: 'Intermediate Levels', value: 'Intermediate to Proficient', inline: false },
                { name: 'Advanced Levels', value: 'Advanced to Experienced', inline: false },
                { name: 'Master Levels', value: 'Advanced Practitioner to Luminary', inline: false },
                { name: 'Elite Levels', value: 'Prime and Eternal tiers', inline: false }
            );
        await interaction.reply({ embeds: [embed] });
    }
    
    if (commandName === 'claninfo') {
        const embed = new EmbedBuilder()
            .setTitle('🏰 Clan Information')
            .setDescription('Our community information')
            .setColor(0xf1c40f)
            .addFields(
                { name: 'About Us', value: 'Focused on growth, teamwork, and excellence.', inline: false },
                { name: 'Get Started', value: 'Read rules → Verify → Participate', inline: false }
            );
        await interaction.reply({ embeds: [embed] });
    }
    
    if (commandName === 'rules') {
        const embed = new EmbedBuilder()
            .setTitle('📜 Server Rules')
            .setDescription('Basic rules to follow:')
            .setColor(0xFF0000)
            .addFields(
                { name: 'Respect Everyone', value: 'No harassment or hate speech.', inline: false },
                { name: 'No Spamming', value: 'Keep messages reasonable.', inline: false },
                { name: 'Appropriate Content', value: 'Keep it family friendly.', inline: false },
                { name: 'Have Fun!', value: 'Enjoy your time here!', inline: false }
            );
        await interaction.reply({ embeds: [embed] });
    }
    
    if (commandName === 'kick') {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: '❌ No permission!', ephemeral: true });
        }
        const member = options.getMember('member');
        const reason = options.getString('reason') || 'No reason';
        try {
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setTitle('👢 Member Kicked')
                .setDescription(`${member} was kicked`)
                .setColor(0xFFA500)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: interaction.user.toString(), inline: false }
                );
            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            interaction.reply({ content: `❌ Failed: ${err.message}`, ephemeral: true });
        }
    }
    
    if (commandName === 'ban') {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: '❌ No permission!', ephemeral: true });
        }
        const member = options.getMember('member');
        const reason = options.getString('reason') || 'No reason';
        try {
            await member.ban({ reason });
            const embed = new EmbedBuilder()
                .setTitle('🔨 Member Banned')
                .setDescription(`${member} was banned`)
                .setColor(0xFF0000)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: interaction.user.toString(), inline: false }
                );
            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            interaction.reply({ content: `❌ Failed: ${err.message}`, ephemeral: true });
        }
    }
    
    if (commandName === 'mute') {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: '❌ No permission!', ephemeral: true });
        }
        const member = options.getMember('member');
        const reason = options.getString('reason') || 'No reason';
        
        let muteRole = guild.roles.cache.find(r => r.name === 'Muted');
        if (!muteRole) {
            try {
                muteRole = await guild.roles.create({
                    name: 'Muted',
                    color: '#95a5a6',
                    permissions: [],
                    reason: 'Mute role'
                });
            } catch (err) {
                return interaction.reply({ content: `❌ Failed to create role: ${err.message}`, ephemeral: true });
            }
        }
        
        try {
            await member.roles.add(muteRole);
            const embed = new EmbedBuilder()
                .setTitle('🔇 Member Muted')
                .setDescription(`${member} was muted`)
                .setColor(0x95a5a6)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: interaction.user.toString(), inline: false }
                );
            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            interaction.reply({ content: `❌ Failed: ${err.message}`, ephemeral: true });
        }
    }
});

// ERROR HANDLING
client.on('error', console.error);
process.on('unhandledRejection', console.error);

// LOGIN
client.login(TOKEN).catch(err => {
    console.error('❌ LOGIN FAILED!');
    console.error('❌ Error:', err.message);
    console.error('❌ Token present:', !!TOKEN);
    if (TOKEN) {
        console.error('❌ Token starts with:', TOKEN.substring(0, 5) + '...');
        console.error('❌ Token length:', TOKEN.length);
    }
    process.exit(1);
});
