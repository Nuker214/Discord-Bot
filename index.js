const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ChannelType, REST, Routes, ActivityType, Colors } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildInvites
    ]
});

let welcomeChannel = null;
let leaveChannel = null;
const prefix = '.';
let commandLogs = [];
const startTime = new Date();

class Logger {
    static log(type, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type}] ${message}`;
        
        console.log(logEntry);
        if (data) console.log(JSON.stringify(data, null, 2));
        
        commandLogs.push({ timestamp, type, message, data });
        if (commandLogs.length > 1000) commandLogs.shift();
        
        const colors = {
            'INFO': '\x1b[36m',
            'SUCCESS': '\x1b[32m',
            'WARNING': '\x1b[33m',
            'ERROR': '\x1b[31m',
            'COMMAND': '\x1b[35m',
            'SYSTEM': '\x1b[34m',
            'DEBUG': '\x1b[90m',
            'MEMORY': '\x1b[93m',
            'NETWORK': '\x1b[95m'
        };
        
        const color = colors[type] || '\x1b[0m';
        const reset = '\x1b[0m';
        
        console.log(`${color}${logEntry}${reset}`);
    }
    
    static getStats() {
        const now = new Date();
        const uptime = now - startTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        
        return {
            uptime: `${hours}h ${minutes}m ${seconds}s`,
            startTime: startTime.toISOString(),
            totalCommands: commandLogs.filter(log => log.type === 'COMMAND').length,
            totalErrors: commandLogs.filter(log => log.type === 'ERROR').length,
            memoryUsage: process.memoryUsage(),
            commandHistory: commandLogs.slice(-10)
        };
    }
}

function applyCustomFont(text) {
    const fontMap = {
        'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ꜰ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ', 'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ',
        'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ', 'S': 'ꜱ', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ',
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ',
        'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 'ꜱ', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
        '0': '𝟢', '1': '𝟣', '2': '𝟤', '3': '𝟥', '4': '𝟦', '5': '𝟧', '6': '𝟨', '7': '𝟩', '8': '𝟪', '9': '𝟫'
    };
    
    return text.split('').map(char => fontMap[char] || char).join('');
}

function generateGradientColors(startColor, endColor, steps) {
    const colors = [];
    const start = parseInt(startColor.slice(1), 16);
    const end = parseInt(endColor.slice(1), 16);
    
    const startR = (start >> 16) & 255;
    const startG = (start >> 8) & 255;
    const startB = start & 255;
    
    const endR = (end >> 16) & 255;
    const endG = (end >> 8) & 255;
    const endB = end & 255;
    
    for (let i = 0; i < steps; i++) {
        const ratio = i / (steps - 1);
        const r = Math.round(startR + (endR - startR) * ratio);
        const g = Math.round(startG + (endG - startG) * ratio);
        const b = Math.round(startB + (endB - startB) * ratio);
        
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colors.push(hex);
    }
    
    return colors;
}

const GRADIENT_COLORS = generateGradientColors("#FFFF00", "#FF0000", 22);

const RANKING_ROLES = [
    { name: applyCustomFont("Observer I"), color: GRADIENT_COLORS[0] },
    { name: applyCustomFont("Observer II"), color: GRADIENT_COLORS[0] },
    { name: applyCustomFont("Observer III"), color: GRADIENT_COLORS[0] },
    { name: applyCustomFont("Initiate I"), color: GRADIENT_COLORS[2] },
    { name: applyCustomFont("Initiate II"), color: GRADIENT_COLORS[2] },
    { name: applyCustomFont("Initiate III"), color: GRADIENT_COLORS[2] },
    { name: applyCustomFont("Novitiate I"), color: GRADIENT_COLORS[4] },
    { name: applyCustomFont("Novitiate II"), color: GRADIENT_COLORS[4] },
    { name: applyCustomFont("Novitiate III"), color: GRADIENT_COLORS[4] },
    { name: applyCustomFont("Apprentice I"), color: GRADIENT_COLORS[6] },
    { name: applyCustomFont("Apprentice II"), color: GRADIENT_COLORS[6] },
    { name: applyCustomFont("Apprentice III"), color: GRADIENT_COLORS[6] },
    { name: applyCustomFont("Intermediate I"), color: GRADIENT_COLORS[8] },
    { name: applyCustomFont("Intermediate II"), color: GRADIENT_COLORS[8] },
    { name: applyCustomFont("Intermediate III"), color: GRADIENT_COLORS[8] },
    { name: applyCustomFont("Practitioner I"), color: GRADIENT_COLORS[10] },
    { name: applyCustomFont("Practitioner II"), color: GRADIENT_COLORS[10] },
    { name: applyCustomFont("Practitioner III"), color: GRADIENT_COLORS[10] },
    { name: applyCustomFont("Proficient I"), color: GRADIENT_COLORS[12] },
    { name: applyCustomFont("Proficient II"), color: GRADIENT_COLORS[12] },
    { name: applyCustomFont("Proficient III"), color: GRADIENT_COLORS[12] },
    { name: applyCustomFont("Advanced I"), color: GRADIENT_COLORS[14] },
    { name: applyCustomFont("Advanced II"), color: GRADIENT_COLORS[14] },
    { name: applyCustomFont("Advanced III"), color: GRADIENT_COLORS[14] },
    { name: applyCustomFont("Experienced I"), color: GRADIENT_COLORS[16] },
    { name: applyCustomFont("Experienced II"), color: GRADIENT_COLORS[16] },
    { name: applyCustomFont("Experienced III"), color: GRADIENT_COLORS[16] },
    { name: applyCustomFont("Advanced Practitioner I"), color: GRADIENT_COLORS[17] },
    { name: applyCustomFont("Advanced Practitioner II"), color: GRADIENT_COLORS[17] },
    { name: applyCustomFont("Advanced Practitioner III"), color: GRADIENT_COLORS[17] },
    { name: applyCustomFont("Ascendant I"), color: GRADIENT_COLORS[18] },
    { name: applyCustomFont("Ascendant II"), color: GRADIENT_COLORS[18] },
    { name: applyCustomFont("Ascendant III"), color: GRADIENT_COLORS[18] },
    { name: applyCustomFont("Transcendent I"), color: GRADIENT_COLORS[19] },
    { name: applyCustomFont("Transcendent II"), color: GRADIENT_COLORS[19] },
    { name: applyCustomFont("Transcendent III"), color: GRADIENT_COLORS[19] },
    { name: applyCustomFont("Luminary I"), color: GRADIENT_COLORS[20] },
    { name: applyCustomFont("Luminary II"), color: GRADIENT_COLORS[20] },
    { name: applyCustomFont("Luminary III"), color: GRADIENT_COLORS[20] },
    { name: applyCustomFont("Ascendant Prime I"), color: GRADIENT_COLORS[21] },
    { name: applyCustomFont("Ascendant Prime II"), color: GRADIENT_COLORS[21] },
    { name: applyCustomFont("Ascendant Prime III"), color: GRADIENT_COLORS[21] },
    { name: applyCustomFont("Transcendent Prime I"), color: "#990000" },
    { name: applyCustomFont("Transcendent Prime II"), color: "#990000" },
    { name: applyCustomFont("Transcendent Prime III"), color: "#990000" },
    { name: applyCustomFont("Luminary Prime I"), color: "#660000" },
    { name: applyCustomFont("Luminary Prime II"), color: "#660000" },
    { name: applyCustomFont("Luminary Prime III"), color: "#660000" },
    { name: applyCustomFont("Luminary Eternal I"), color: "#330000" },
    { name: applyCustomFont("Luminary Eternal II"), color: "#330000" },
    { name: applyCustomFont("Luminary Eternal III"), color: "#330000" },
    { name: applyCustomFont("Ascendant Eternal I"), color: "#1A0000" },
    { name: applyCustomFont("Ascendant Eternal II"), color: "#1A0000" },
    { name: applyCustomFont("Ascendant Eternal III"), color: "#1A0000" },
    { name: applyCustomFont("Transcendent Eternal I"), color: "#000000" },
    { name: applyCustomFont("Transcendent Eternal II"), color: "#000000" },
    { name: applyCustomFont("Transcendent Eternal III"), color: "#000000" },
    { name: applyCustomFont("Omniscient I"), color: "#000000" },
    { name: applyCustomFont("Omniscient II"), color: "#000000" },
    { name: applyCustomFont("Omniscient III"), color: "#000000" },
    { name: applyCustomFont("Nexithal I"), color: "#000000" },
    { name: applyCustomFont("Nexithal II"), color: "#000000" },
    { name: applyCustomFont("Nexithal III"), color: "#000000" },
    { name: applyCustomFont("Zethithal I"), color: "#000000" },
    { name: applyCustomFont("Zethithal II"), color: "#000000" },
    { name: applyCustomFont("Zethithal III"), color: "#000000" }
];

const ALL_ROLES = [
    { name: applyCustomFont("Partial Access Members"), color: "#1E90FF" },
    { name: applyCustomFont("Partial Access Allies"), color: "#4169E1" },
    { name: applyCustomFont("Partial Access Training"), color: "#6495ED" },
    { name: applyCustomFont("Partial Access Misc"), color: "#4682B4" },
    { name: applyCustomFont("Partial Access Information"), color: "#5F9EA0" },
    { name: applyCustomFont("Members"), color: "#32CD32" },
    { name: applyCustomFont("Allies"), color: "#228B22" },
    { name: applyCustomFont("Rank Evaluators"), color: "#006400" },
    { name: applyCustomFont("Rank Approvals"), color: "#008000" },
    { name: applyCustomFont("Training Access"), color: "#7CFC00" },
    { name: applyCustomFont("Allies Access"), color: "#00FF00" },
    { name: applyCustomFont("Misc Access"), color: "#90EE90" },
    { name: applyCustomFont("Information Access"), color: "#98FB98" },
    { name: applyCustomFont("Announcements Access"), color: "#00FA9A" },
    { name: applyCustomFont("Events Access"), color: "#00FF7F" },
    { name: applyCustomFont("Target List Access"), color: "#2E8B57" },
    { name: applyCustomFont("Enemies"), color: "#FF0000" },
    { name: applyCustomFont("Traitor"), color: "#8B0000" },
    { name: applyCustomFont("Trusted"), color: "#9370DB" },
    { name: applyCustomFont("Friends"), color: "#8A2BE2" },
    { name: applyCustomFont("Emojis Permissions"), color: "#FFD700" },
    { name: applyCustomFont("Stickers Permissions"), color: "#FFA500" },
    { name: applyCustomFont("Gifs Permissions"), color: "#FF8C00" },
    { name: applyCustomFont("Image Permissions"), color: "#FF6347" },
    { name: applyCustomFont("Slowmode Bypass"), color: "#FF4500" },
    { name: applyCustomFont("Leader"), color: "#DC143C" },
    { name: applyCustomFont("Leader Assistant"), color: "#B22222" },
    { name: applyCustomFont("Council Leader"), color: "#8B008B" },
    { name: applyCustomFont("Council Assistant"), color: "#9932CC" },
    { name: applyCustomFont("Council Of Security"), color: "#9400D3" },
    { name: applyCustomFont("Council Of Strategy"), color: "#8A2BE2" },
    { name: applyCustomFont("Council Of Training"), color: "#9370DB" },
    { name: applyCustomFont("Council Of Creation"), color: "#BA55D3" },
    { name: applyCustomFont("Right Hand"), color: "#DA70D6" },
    { name: applyCustomFont("Left Hand"), color: "#EE82EE" },
    { name: applyCustomFont("Messager"), color: "#DDA0DD" },
    { name: applyCustomFont("Bots"), color: "#2F4F4F" },
    { name: applyCustomFont("Scripter"), color: "#FF8C00" },
    { name: applyCustomFont("Coder"), color: "#FF7F50" },
    { name: applyCustomFont("Evaluation Access"), color: "#FF6347" },
    { name: applyCustomFont("Evaluation Needed"), color: "#FFD700" },
    { name: applyCustomFont("Verification Needed"), color: "#FFA500" },
    { name: applyCustomFont("Agreement Needed"), color: "#FF8C00" },
    { name: applyCustomFont("Verification Accepted"), color: "#32CD32" },
    { name: applyCustomFont("Agreement Accepted"), color: "#228B22" },
    { name: applyCustomFont("Agreement Denied"), color: "#FF0000" },
    { name: applyCustomFont("Been Evaluated"), color: "#1E90FF" },
    { name: applyCustomFont("Accepted"), color: "#00FF00" },
    { name: applyCustomFont("Access Removed"), color: "#8B0000" }
];

const CHANNEL_STRUCTURE = [
    {
        name: "📁 " + applyCustomFont("Uncategorized"),
        channels: [
            "📝 " + applyCustomFont("verification-request"),
            "⏳ " + applyCustomFont("waiting-lounge"),
            "✅ " + applyCustomFont("agreement-verification")
        ]
    },
    {
        name: "🎉 " + applyCustomFont("Welcome & Info"),
        channels: [
            "👋 " + applyCustomFont("welcome-chat"),
            "👋 " + applyCustomFont("leave-chat"),
            "📢 " + applyCustomFont("announcements"),
            "📜 " + applyCustomFont("rules"),
            "🏰 " + applyCustomFont("clan-info"),
            "🏆 " + applyCustomFont("achievements"),
            "📅 " + applyCustomFont("events"),
            "📚 " + applyCustomFont("resources")
        ]
    },
    {
        name: "🔧 " + applyCustomFont("Miscellaneous"),
        channels: [
            "👥 " + applyCustomFont("role-list"),
            "ℹ️ " + applyCustomFont("role-information"),
            "🎯 " + applyCustomFont("target-list"),
            "🤝 " + applyCustomFont("clan-allies"),
            "🌐 " + applyCustomFont("clan-allies-servers"),
            "⚔️ " + applyCustomFont("clan-wars")
        ]
    },
    {
        name: "💬 " + applyCustomFont("Lounge"),
        channels: [
            "💭 " + applyCustomFont("general-chat"),
            "🎮 " + applyCustomFont("game-chat"),
            "🖼️ " + applyCustomFont("media"),
            "🎵 " + applyCustomFont("music"),
            "🗣️ " + applyCustomFont("off-topic"),
            "🔊 " + applyCustomFont("voice-chat")
        ]
    },
    {
        name: "🤝 " + applyCustomFont("Clan Allies"),
        channels: [
            "💬 " + applyCustomFont("allies-chat"),
            "🖼️ " + applyCustomFont("allies-media"),
            "📜 " + applyCustomFont("treaties"),
            "💡 " + applyCustomFont("alliance-ideas"),
            "📝 " + applyCustomFont("alliance-notes"),
            "💬 " + applyCustomFont("discussion")
        ]
    },
    {
        name: "🎓 " + applyCustomFont("Training"),
        channels: [
            "📈 " + applyCustomFont("progress"),
            "👨‍🏫 " + applyCustomFont("mentor-chat"),
            "🖼️ " + applyCustomFont("mentors-media"),
            "💡 " + applyCustomFont("tips"),
            "⚔️ " + applyCustomFont("strategies"),
            "📊 " + applyCustomFont("tracking"),
            "🔄 " + applyCustomFont("practice-sessions"),
            "📝 " + applyCustomFont("feedback")
        ]
    },
    {
        name: "📋 " + applyCustomFont("Evaluation"),
        channels: [
            "📄 " + applyCustomFont("evaluation-template"),
            "📊 " + applyCustomFont("evaluations-results"),
            "🔄 " + applyCustomFont("retake-evaluation"),
            "📝 " + applyCustomFont("evaluation-request"),
            "🔒 " + applyCustomFont("private-servers")
        ]
    }
];

client.once('ready', async () => {
    Logger.log('SYSTEM', '══════════════════════════════════════════════════════════');
    Logger.log('SYSTEM', '🚀 DISCORD BOT INITIALIZATION STARTED');
    Logger.log('SYSTEM', '══════════════════════════════════════════════════════════');
    Logger.log('INFO', `Bot User: ${client.user.tag} (ID: ${client.user.id})`);
    Logger.log('INFO', `Client ID: ${CLIENT_ID}`);
    Logger.log('INFO', `Target Guild ID: ${GUILD_ID}`);
    Logger.log('INFO', `Prefix: ${prefix}`);
    Logger.log('INFO', `Node.js Version: ${process.version}`);
    Logger.log('INFO', `Platform: ${process.platform} ${process.arch}`);
    Logger.log('INFO', `Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    
    const guilds = client.guilds.cache;
    Logger.log('NETWORK', `Connected to ${guilds.size} server(s):`);
    guilds.forEach(guild => {
        Logger.log('NETWORK', `  • ${guild.name} (${guild.id}) - ${guild.memberCount} members`);
    });
    
    const activities = [
        { name: `${prefix}help | Watching ${guilds.size} servers`, type: ActivityType.Watching },
        { name: `Managing ${ALL_ROLES.length} roles`, type: ActivityType.Competing },
        { name: `${prefix}ping for latency`, type: ActivityType.Playing },
        { name: `Custom Font System v2.0`, type: ActivityType.Streaming, url: 'https://twitch.tv/discord' }
    ];
    
    let currentActivity = 0;
    setInterval(() => {
        client.user.setActivity(activities[currentActivity]);
        currentActivity = (currentActivity + 1) % activities.length;
    }, 30000);
    
    client.user.setActivity(activities[0]);
    client.user.setStatus('online');
    
    setInterval(() => {
        const stats = Logger.getStats();
        Logger.log('MEMORY', `Uptime: ${stats.uptime} | Commands: ${stats.totalCommands} | Memory: ${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)}MB`);
    }, 60000);
    
    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        const commands = [
            {
                name: 'ping',
                description: '🏓 Check bot latency and status'
            },
            {
                name: 'rolelist',
                description: '📊 Show all ranking roles'
            },
            {
                name: 'membercount',
                description: '👥 Show server member statistics'
            },
            {
                name: 'help',
                description: '❓ Show help menu with all commands'
            },
            {
                name: 'stats',
                description: '📈 Show bot statistics and uptime'
            }
        ];
        
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        Logger.log('SUCCESS', `Registered ${commands.length} slash commands successfully`);
    } catch (err) {
        Logger.log('ERROR', `Failed to register slash commands: ${err.message}`);
    }
    
    Logger.log('SUCCESS', '══════════════════════════════════════════════════════════');
    Logger.log('SUCCESS', '✅ BOT IS NOW FULLY OPERATIONAL AND READY FOR COMMANDS');
    Logger.log('SUCCESS', '══════════════════════════════════════════════════════════');
});

client.on('guildMemberAdd', async member => {
    Logger.log('INFO', `Member joined: ${member.user.tag} (${member.id})`);
    
    try {
        const verificationNeeded = member.guild.roles.cache.find(role => role.name === applyCustomFont("Verification Needed"));
        const agreementNeeded = member.guild.roles.cache.find(role => role.name === applyCustomFont("Agreement Needed"));
        const evaluationNeeded = member.guild.roles.cache.find(role => role.name === applyCustomFont("Evaluation Needed"));
        
        const rolesToAssign = [];
        if (verificationNeeded) rolesToAssign.push(verificationNeeded);
        if (agreementNeeded) rolesToAssign.push(agreementNeeded);
        if (evaluationNeeded) rolesToAssign.push(evaluationNeeded);
        
        if (rolesToAssign.length > 0) {
            await member.roles.add(rolesToAssign);
            Logger.log('SUCCESS', `Auto-assigned ${rolesToAssign.length} verification roles to ${member.user.tag}`);
            
            try {
                const welcomeDM = new EmbedBuilder()
                    .setTitle('👋 Welcome to the Server!')
                    .setDescription(`Hello ${member.user.username}! Welcome to our community.`)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '📋 Next Steps', value: '1. Check #rules\n2. Complete verification\n3. Agree to guidelines\n4. Get started!' },
                        { name: '🎯 Auto-Assigned Roles', value: '• Verification Needed\n• Agreement Needed\n• Evaluation Needed\n\nComplete these requirements to gain full access.' }
                    )
                    .setFooter({ text: 'Use .help for command list' })
                    .setTimestamp();
                
                await member.send({ embeds: [welcomeDM] });
                Logger.log('INFO', `Sent welcome DM to ${member.user.tag}`);
            } catch (dmError) {
                Logger.log('WARNING', `Could not send welcome DM to ${member.user.tag}: ${dmError.message}`);
            }
        }
    } catch (roleError) {
        Logger.log('ERROR', `Error auto-assigning roles to ${member.user.tag}: ${roleError.message}`);
    }
    
    if (welcomeChannel) {
        try {
            const channel = await client.channels.fetch(welcomeChannel).catch(() => null);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle('🎉 New Member Joined!')
                    .setDescription(`Welcome ${member} to the server!`)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                        { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true }
                    )
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({ text: `Member #${member.guild.memberCount}` })
                    .setTimestamp();

                await channel.send({ content: `${member}`, embeds: [embed] });
                Logger.log('INFO', `Sent welcome message for ${member.user.tag} in ${channel.name}`);
            }
        } catch (error) {
            Logger.log('ERROR', `Error in welcome event: ${error.message}`);
        }
    }
});

client.on('guildMemberRemove', async member => {
    Logger.log('INFO', `Member left: ${member.user.tag} (${member.id})`);
    
    if (leaveChannel) {
        try {
            const channel = await client.channels.fetch(leaveChannel).catch(() => null);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle('👋 Member Left')
                    .setDescription(`**${member.user.tag}** has left the server.`)
                    .setColor(0xFF0000)
                    .addFields(
                        { name: 'Joined', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Unknown', inline: true },
                        { name: 'New Member Count', value: `${member.guild.memberCount}`, inline: true }
                    )
                    .setFooter({ text: 'We hope to see them again!' })
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
            }
        } catch (error) {
            Logger.log('ERROR', `Error in leave event: ${error.message}`);
        }
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const guild = message.guild;
    
    Logger.log('COMMAND', `${message.author.tag} used: ${command} ${args.join(' ')}`, {
        userId: message.author.id,
        guildId: guild?.id,
        channelId: message.channel.id,
        timestamp: new Date().toISOString()
    });
    
    if (command === 'role') {
        try {
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                Logger.log('WARNING', `${message.author.tag} attempted .role without permissions`);
                return message.reply('❌ You need Manage Roles permission!');
            }
            
            const member = message.mentions.members.first();
            if (!member) {
                return message.reply('❌ Please mention a member! Usage: `.role @member RoleName`');
            }
            
            const roleName = args.slice(1).join(' ');
            if (!roleName) {
                return message.reply('❌ Please specify a role name! Usage: `.role @member RoleName`');
            }
            
            const role = guild.roles.cache.find(r => 
                r.name.toLowerCase() === roleName.toLowerCase() || 
                r.name === applyCustomFont(roleName)
            );
            
            if (!role) {
                return message.reply(`❌ Role "${roleName}" not found!`);
            }
            
            if (!role.editable) {
                return message.reply('❌ I cannot manage that role! (Role is above my highest role)');
            }
            
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                Logger.log('SUCCESS', `Removed role ${role.name} from ${member.user.tag}`);
                
                const embed = new EmbedBuilder()
                    .setTitle('🔄 Role Removed')
                    .setDescription(`Removed **${role.name}** from ${member}`)
                    .setColor(0xFFA500)
                    .addFields(
                        { name: 'Moderator', value: message.author.toString(), inline: true },
                        { name: 'Role Color', value: role.hexColor, inline: true }
                    )
                    .setTimestamp();
                
                await message.channel.send({ embeds: [embed] });
            } else {
                await member.roles.add(role);
                Logger.log('SUCCESS', `Added role ${role.name} to ${member.user.tag}`);
                
                const embed = new EmbedBuilder()
                    .setTitle('✅ Role Assigned')
                    .setDescription(`Added **${role.name}** to ${member}`)
                    .setColor(role.color || 0x00FF00)
                    .addFields(
                        { name: 'Moderator', value: message.author.toString(), inline: true },
                        { name: 'Role Color', value: role.hexColor, inline: true }
                    )
                    .setTimestamp();
                
                await message.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            Logger.log('ERROR', `Error in .role command: ${error.message}`);
            message.reply(`❌ Error: ${error.message}`);
        }
    }
    
    else if (command === 'ping') {
        const sent = await message.channel.send('🏓 Pinging...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);
        
        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setColor(0x00FF00)
            .addFields(
                { name: '📡 Bot Latency', value: `${latency}ms`, inline: true },
                { name: '🌐 API Latency', value: `${apiLatency}ms`, inline: true },
                { name: '🖥️ Uptime', value: Logger.getStats().uptime, inline: true }
            )
            .setFooter({ text: `Shard: ${client.shard?.ids || 0} | Guild: ${guild?.name || 'DM'}` })
            .setTimestamp();
        
        await sent.edit({ content: null, embeds: [embed] });
        Logger.log('DEBUG', `Ping command executed - Bot: ${latency}ms, API: ${apiLatency}ms`);
    }
    
    else if (command === 'embed') {
        const text = args.join(' ');
        if (!text) {
            return message.reply('❌ Please provide text! Usage: `.embed Your text here`');
        }
        
        const embed = new EmbedBuilder()
            .setDescription(text)
            .setColor(0x5865F2)
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
        Logger.log('INFO', `${message.author.tag} created embed: ${text.substring(0, 50)}...`);
    }
    
    else if (command === 'membercount') {
        const members = await guild.members.fetch();
        const total = members.size;
        const online = members.filter(m => m.presence?.status === 'online').size;
        const idle = members.filter(m => m.presence?.status === 'idle').size;
        const dnd = members.filter(m => m.presence?.status === 'dnd').size;
        const offline = members.filter(m => !m.presence || m.presence.status === 'offline').size;
        const bots = members.filter(m => m.user.bot).size;
        const humans = total - bots;
        
        const embed = new EmbedBuilder()
            .setTitle(`👥 ${guild.name} Member Statistics`)
            .setColor(0x5865F2)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '📊 Total Members', value: `${total}`, inline: true },
                { name: '🤖 Bots', value: `${bots}`, inline: true },
                { name: '👤 Humans', value: `${humans}`, inline: true },
                { name: '🟢 Online', value: `${online}`, inline: true },
                { name: '🟡 Idle', value: `${idle}`, inline: true },
                { name: '🔴 Do Not Disturb', value: `${dnd}`, inline: true },
                { name: '⚫ Offline', value: `${offline}`, inline: true }
            )
            .setFooter({ text: `Server Created: ${guild.createdAt.toDateString()}` })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
        Logger.log('INFO', `Membercount command executed - Total: ${total}, Online: ${online}`);
    }
    
    else if (command === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('❓ Bot Help Menu')
            .setDescription(`Prefix: \`${prefix}\`\nTotal Commands: 22+`)
            .setColor(0x5865F2)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                {
                    name: '🔧 Utility Commands',
                    value: '```.ping - Check bot latency\n.embed <text> - Create embed\n.membercount - Show member stats\n.help - This menu\n.stats - Bot statistics```',
                    inline: false
                },
                {
                    name: '👥 Role Management',
                    value: '```.role @member <role> - Assign/remove role\n.rolelistembed - List ranking roles\n.roleinfoembed - Role info\n.rolemake - Create all roles\n.deleteroles - Delete all roles```',
                    inline: false
                },
                {
                    name: '📊 Ranking System',
                    value: '```.setuprankings - Create ranking roles\n.deleterankings - Delete ranking roles```',
                    inline: false
                },
                {
                    name: '📁 Channel Management',
                    value: '```.channelsmake - Create all channels\n.channelsdelete - Delete all channels```',
                    inline: false
                },
                {
                    name: '🛡️ Moderation',
                    value: '```.kick @member [reason]\n.ban @member [reason]\n.mute @member [reason]```',
                    inline: false
                },
                {
                    name: '✅ Verification',
                    value: '```.verify @member\n.unverify @member\n.checkagreement @member\n.allowagreement @member\n.allowaccess @member\n.removeaccess @member```',
                    inline: false
                },
                {
                    name: '⚙️ Settings',
                    value: '```.enablewelcomechat\n.enableleavechat\n.disablewelcomechat\n.disableleavechat```',
                    inline: false
                },
                {
                    name: '📜 Information',
                    value: '```.rulesembed - Server rules\n.claninfoembed - Clan info```',
                    inline: false
                }
            )
            .setFooter({ text: `Bot Version 2.0 | ${client.guilds.cache.size} servers` })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
        Logger.log('INFO', `Help command executed by ${message.author.tag}`);
    }
    
    else if (command === 'stats') {
        const stats = Logger.getStats();
        const memory = stats.memoryUsage;
        
        const embed = new EmbedBuilder()
            .setTitle('📈 Bot Statistics')
            .setColor(0x5865F2)
            .addFields(
                { name: '⏱️ Uptime', value: stats.uptime, inline: true },
                { name: '🏁 Started', value: new Date(stats.startTime).toLocaleString(), inline: true },
                { name: '📊 Commands Executed', value: stats.totalCommands.toString(), inline: true },
                { name: '⚠️ Total Errors', value: stats.totalErrors.toString(), inline: true },
                { name: '💾 Memory Usage', value: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`, inline: true },
                { name: '📡 Servers', value: client.guilds.cache.size.toString(), inline: true },
                { name: '🤖 Users Cached', value: client.users.cache.size.toString(), inline: true },
                { name: '🔄 Node.js', value: process.version, inline: true },
                { name: '⚙️ Platform', value: `${process.platform} ${process.arch}`, inline: true }
            )
            .setFooter({ text: 'Detailed logs available in Render console' })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
    }
    
    else if (command === 'rolelistembed') {
        const roles = guild.roles.cache.filter(r => RANKING_ROLES.some(roleData => roleData.name === r.name));
        const embed = new EmbedBuilder()
            .setTitle('📊 Ranking Roles List')
            .setDescription(`**Total Ranking Roles:** ${roles.size}`)
            .setColor(0xFFD700);
        
        if (roles.size === 0) {
            embed.setDescription('No ranking roles found. Use `.setuprankings` to create them!');
        } else {
            const roleChunks = [];
            const roleArray = Array.from(roles.values());
            
            for (let i = 0; i < roleArray.length; i += 20) {
                roleChunks.push(roleArray.slice(i, i + 20));
            }
            
            roleChunks.forEach((chunk, index) => {
                const roleList = chunk.map(r => r.toString()).join('\n');
                embed.addFields({
                    name: `Rankings ${roleChunks.length > 1 ? `Part ${index + 1}` : ''}`,
                    value: roleList || 'None',
                    inline: false
                });
            });
        }
        
        const pingRoles = roles.first(5).map(r => r.toString()).join(' ');
        await message.channel.send({ content: pingRoles || '', embeds: [embed] });
        Logger.log('INFO', `Rolelistembed executed - ${roles.size} roles listed`);
    }
    
    else if (command === 'roleinfoembed') {
        const embed = new EmbedBuilder()
            .setTitle('ℹ️ Role Information')
            .setDescription('Complete ranking system explanation:')
            .setColor(0x2ECC71)
            .addFields(
                { name: '🟡 Beginner Ranks', value: 'Observer → Initiate → Novitiate → Apprentice', inline: false },
                { name: '🟠 Intermediate Ranks', value: 'Intermediate → Practitioner → Proficient', inline: false },
                { name: '🔴 Advanced Ranks', value: 'Advanced → Experienced → Advanced Practitioner', inline: false },
                { name: '⚫ Elite Ranks', value: 'Ascendant → Transcendent → Luminary', inline: false }
            );
        
        await message.channel.send({ embeds: [embed] });
    }
    
    else if (command === 'claninfoembed') {
        const embed = new EmbedBuilder()
            .setTitle('🏰 Clan Information')
            .setDescription('Welcome to our community!')
            .setColor(0xF1C40F)
            .addFields(
                { name: 'About Us', value: 'Dedicated group focused on growth, teamwork, and excellence.', inline: false },
                { name: 'Our Mission', value: 'Create supportive environment for skill development.', inline: false }
            );
        
        await message.channel.send({ embeds: [embed] });
    }
    
    else if (command === 'enablewelcomechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        welcomeChannel = message.channel.id;
        const embed = new EmbedBuilder()
            .setTitle('✅ Welcome Chat Enabled')
            .setDescription(`Welcome messages enabled in ${message.channel}`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
        Logger.log('SYSTEM', `Welcome channel set to: ${message.channel.name} (${message.channel.id})`);
    }
    
    else if (command === 'enableleavechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        leaveChannel = message.channel.id;
        const embed = new EmbedBuilder()
            .setTitle('✅ Leave Chat Enabled')
            .setDescription(`Leave messages enabled in ${message.channel}`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
        Logger.log('SYSTEM', `Leave channel set to: ${message.channel.name} (${message.channel.id})`);
    }
    
    else if (command === 'disablewelcomechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        welcomeChannel = null;
        await message.reply('✅ Welcome messages disabled');
    }
    
    else if (command === 'disableleavechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        leaveChannel = null;
        await message.reply('✅ Leave messages disabled');
    }
    
    else if (command === 'rulesembed') {
        const embed = new EmbedBuilder()
            .setTitle('📜 Server Rules')
            .setColor(0xFF0000)
            .addFields(
                { name: 'Rule 1: Respect', value: 'Treat everyone with respect.', inline: false },
                { name: 'Rule 2: No Spamming', value: 'No excessive messages.', inline: false },
                { name: 'Rule 3: Appropriate Content', value: 'Keep it family friendly.', inline: false },
                { name: 'Rule 4: No Advertising', value: 'No unsolicited ads.', inline: false },
                { name: 'Rule 5: Follow Discord TOS', value: 'Always follow Discord rules.', inline: false },
                { name: 'Rule 6: Proper Channels', value: 'Use correct channels.', inline: false },
                { name: 'Rule 7: Listen to Staff', value: 'Follow staff instructions.', inline: false },
                { name: 'Rule 8: No Drama', value: 'Keep conflicts private.', inline: false },
                { name: 'Rule 9: English Only', value: 'English in public channels.', inline: false },
                { name: 'Rule 10: Have Fun!', value: 'Enjoy your time here!', inline: false }
            );
        await message.channel.send({ embeds: [embed] });
    }
    
    else if (command === 'deleterankings') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        let deleted = 0;
        for (const roleData of RANKING_ROLES) {
            const role = guild.roles.cache.find(r => r.name === roleData.name);
            if (role) {
                try {
                    await role.delete();
                    deleted++;
                } catch (err) {}
            }
        }
        await message.reply(`✅ Deleted ${deleted} ranking roles`);
        Logger.log('SYSTEM', `Deleted ${deleted} ranking roles`);
    }
    
    else if (command === 'setuprankings') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        
        await message.channel.send('🔄 Creating ranking roles with gradient colors...');
        let created = 0;
        
        for (const roleData of RANKING_ROLES) {
            if (!guild.roles.cache.find(r => r.name === roleData.name)) {
                try {
                    await guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        mentionable: true,
                        reason: 'Ranking role setup'
                    });
                    created++;
                } catch (err) {
                    console.error(`Failed to create ${roleData.name}:`, err.message);
                }
            }
        }
        
        const verificationRoles = [
            { name: applyCustomFont("Verification Needed"), color: "#FFA500" },
            { name: applyCustomFont("Agreement Needed"), color: "#FF8C00" },
            { name: applyCustomFont("Evaluation Needed"), color: "#FFD700" }
        ];
        
        for (const roleData of verificationRoles) {
            if (!guild.roles.cache.find(r => r.name === roleData.name)) {
                try {
                    await guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        mentionable: true,
                        reason: 'Verification role setup'
                    });
                } catch (err) {}
            }
        }
        
        await message.channel.send(`✅ Created ${created} ranking roles with gradient colors!\n✅ Also created 3 auto-assign verification roles.`);
        Logger.log('SYSTEM', `Created ${created} ranking roles and 3 verification roles`);
    }
    
    else if (command === 'rolemake') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        
        await message.channel.send('🔄 Creating all server roles...');
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
                } catch (err) {
                    console.error(`Failed to create ${roleData.name}:`, err.message);
                }
            }
        }
        
        await message.channel.send(`✅ Created ${created} roles with custom font and colors!`);
        Logger.log('SYSTEM', `Created ${created} roles`);
    }
    
    else if (command === 'deleteroles') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
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
        await message.reply(`✅ Deleted ${deleted} roles`);
        Logger.log('SYSTEM', `Deleted ${deleted} roles`);
    }
    
    else if (command === 'kick') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply('❌ Kick permission required!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        const reason = args.slice(1).join(' ') || 'No reason';
        try {
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setTitle('👢 Member Kicked')
                .setDescription(`${member} was kicked`)
                .setColor(0xFFA500)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Moderator', value: message.author.toString() }
                );
            await message.channel.send({ embeds: [embed] });
            Logger.log('MODERATION', `Kicked ${member.user.tag} for: ${reason}`);
        } catch (err) {
            message.reply(`❌ Failed: ${err.message}`);
            Logger.log('ERROR', `Kick failed for ${member?.user?.tag}: ${err.message}`);
        }
    }
    
    else if (command === 'ban') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ Ban permission required!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        const reason = args.slice(1).join(' ') || 'No reason';
        try {
            await member.ban({ reason });
            const embed = new EmbedBuilder()
                .setTitle('🔨 Member Banned')
                .setDescription(`${member} was banned`)
                .setColor(0xFF0000)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Moderator', value: message.author.toString() }
                );
            await message.channel.send({ embeds: [embed] });
            Logger.log('MODERATION', `Banned ${member.user.tag} for: ${reason}`);
        } catch (err) {
            message.reply(`❌ Failed: ${err.message}`);
            Logger.log('ERROR', `Ban failed for ${member?.user?.tag}: ${err.message}`);
        }
    }
    
    else if (command === 'mute') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Manage roles permission required!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        const reason = args.slice(1).join(' ') || 'No reason';
        
        let muteRole = guild.roles.cache.find(r => r.name === applyCustomFont("Muted"));
        if (!muteRole) {
            try {
                muteRole = await guild.roles.create({
                    name: applyCustomFont("Muted"),
                    color: '#95a5a6',
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
                    { name: 'Reason', value: reason },
                    { name: 'Moderator', value: message.author.toString() }
                );
            await message.channel.send({ embeds: [embed] });
            Logger.log('MODERATION', `Muted ${member.user.tag} for: ${reason}`);
        } catch (err) {
            message.reply(`❌ Failed: ${err.message}`);
        }
    }
    
    else if (command === 'channelsmake') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        
        await message.channel.send('🔄 Creating all channels with custom font...');
        let created = 0;
        
        for (const categoryData of CHANNEL_STRUCTURE) {
            try {
                const category = await guild.channels.create({
                    name: categoryData.name,
                    type: ChannelType.GuildCategory
                });
                
                for (const channelName of categoryData.channels) {
                    try {
                        if (channelName.includes('🔊') || channelName.toLowerCase().includes('voice')) {
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
        
        await message.channel.send(`✅ Created ${created} channels with custom font!`);
        Logger.log('SYSTEM', `Created ${created} channels`);
    }
    
    else if (command === 'channelsdelete') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
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
        await message.reply(`✅ Deleted ${deleted} channels`);
        Logger.log('SYSTEM', `Deleted ${deleted} channels`);
    }
    
    else if (command === 'verify') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Manage roles permission required!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        
        const verificationNeeded = guild.roles.cache.find(r => r.name === applyCustomFont("Verification Needed"));
        const verificationAccepted = guild.roles.cache.find(r => r.name === applyCustomFont("Verification Accepted"));
        const partialMember = guild.roles.cache.find(r => r.name === applyCustomFont("Partial Access Members"));
        
        if (verificationNeeded && member.roles.cache.has(verificationNeeded.id)) {
            await member.roles.remove(verificationNeeded);
        }
        if (verificationAccepted) await member.roles.add(verificationAccepted);
        if (partialMember) await member.roles.add(partialMember);
        
        await message.reply(`✅ ${member} verified with partial access`);
    }
    
    else if (command === 'unverify') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Manage roles permission required!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        
        const verificationAccepted = guild.roles.cache.find(r => r.name === applyCustomFont("Verification Accepted"));
        const partialMember = guild.roles.cache.find(r => r.name === applyCustomFont("Partial Access Members"));
        const verificationNeeded = guild.roles.cache.find(r => r.name === applyCustomFont("Verification Needed"));
        
        if (verificationAccepted && member.roles.cache.has(verificationAccepted.id)) {
            await member.roles.remove(verificationAccepted);
        }
        if (partialMember && member.roles.cache.has(partialMember.id)) {
            await member.roles.remove(partialMember);
        }
        if (verificationNeeded) await member.roles.add(verificationNeeded);
        
        await message.reply(`✅ ${member} unverified`);
    }
    
    else if (command === 'checkagreement') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Manage roles permission required!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        
        const agreementNeeded = guild.roles.cache.find(r => r.name === applyCustomFont("Agreement Needed"));
        const agreementAccepted = guild.roles.cache.find(r => r.name === applyCustomFont("Agreement Accepted"));
        const agreementDenied = guild.roles.cache.find(r => r.name === applyCustomFont("Agreement Denied"));
        
        let status = 'Unknown';
        if (agreementNeeded && member.roles.cache.has(agreementNeeded.id)) status = 'Agreement Needed';
        else if (agreementAccepted && member.roles.cache.has(agreementAccepted.id)) status = 'Agreement Accepted';
        else if (agreementDenied && member.roles.cache.has(agreementDenied.id)) status = 'Agreement Denied';
        
        await message.reply(`📋 ${member}'s agreement status: **${status}**`);
    }
    
    else if (command === 'allowagreement') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Manage roles permission required!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        
        const agreementNeeded = guild.roles.cache.find(r => r.name === applyCustomFont("Agreement Needed"));
        const agreementAccepted = guild.roles.cache.find(r => r.name === applyCustomFont("Agreement Accepted"));
        const acceptedRole = guild.roles.cache.find(r => r.name === applyCustomFont("Accepted"));
        
        if (agreementNeeded && member.roles.cache.has(agreementNeeded.id)) {
            await member.roles.remove(agreementNeeded);
        }
        if (agreementAccepted) await member.roles.add(agreementAccepted);
        if (acceptedRole) await member.roles.add(acceptedRole);
        
        await message.reply(`✅ ${member}'s agreement accepted`);
    }
    
    else if (command === 'allowaccess') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Manage roles permission required!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        
        const accessRoles = [
            applyCustomFont("Members"),
            applyCustomFont("Training Access"),
            applyCustomFont("Misc Access"),
            applyCustomFont("Evaluation Access"),
            applyCustomFont("Information Access")
        ];
        
        const rolesToAdd = [];
        for (const roleName of accessRoles) {
            const role = guild.roles.cache.find(r => r.name === roleName);
            if (role) rolesToAdd.push(role);
        }
        
        if (rolesToAdd.length > 0) {
            await member.roles.add(rolesToAdd);
        }
        
        await message.reply(`✅ ${member} granted full access`);
    }
    
    else if (command === 'removeaccess') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Manage roles permission required!');
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ Mention a member!');
        
        const rolesToRemove = member.roles.cache.filter(r => r.name !== '@everyone');
        if (rolesToRemove.size > 0) {
            await member.roles.remove(rolesToRemove);
        }
        
        const accessRemoved = guild.roles.cache.find(r => r.name === applyCustomFont("Access Removed"));
        if (accessRemoved) {
            await member.roles.add(accessRemoved);
        }
        
        await message.reply(`✅ ${member}'s access removed`);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    const { commandName, options } = interaction;
    const guild = interaction.guild;
    
    Logger.log('COMMAND', `${interaction.user.tag} used slash: /${commandName}`, {
        userId: interaction.user.id,
        guildId: guild?.id,
        channelId: interaction.channelId
    });
    
    if (commandName === 'ping') {
        const latency = Date.now() - interaction.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);
        
        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setColor(0x00FF00)
            .addFields(
                { name: '📡 Bot Latency', value: `${latency}ms`, inline: true },
                { name: '🌐 API Latency', value: `${apiLatency}ms`, inline: true }
            )
            .setFooter({ text: 'Use .help for more commands' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
    
    else if (commandName === 'rolelist') {
        const roles = guild.roles.cache.filter(r => RANKING_ROLES.some(roleData => roleData.name === r.name));
        const embed = new EmbedBuilder()
            .setTitle('📊 Ranking Roles')
            .setDescription(`Total: ${roles.size} roles`)
            .setColor(0xFFD700);
        
        if (roles.size > 0) {
            const roleList = roles.first(15).map(r => r.toString()).join('\n');
            embed.addFields({ name: 'Roles', value: roleList });
        }
        
        await interaction.reply({ embeds: [embed] });
    }
    
    else if (commandName === 'membercount') {
        const members = await guild.members.fetch();
        const total = members.size;
        const online = members.filter(m => m.presence?.status === 'online').size;
        
        const embed = new EmbedBuilder()
            .setTitle('👥 Member Count')
            .setColor(0x5865F2)
            .addFields(
                { name: 'Total Members', value: `${total}`, inline: true },
                { name: 'Online', value: `${online}`, inline: true }
            );
        
        await interaction.reply({ embeds: [embed] });
    }
    
    else if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('❓ Bot Help')
            .setDescription(`Use \`.help\` for detailed command list\n\n**Slash Commands:**\n• /ping - Check latency\n• /rolelist - Show ranking roles\n• /membercount - Member statistics\n• /stats - Bot stats`)
            .setColor(0x5865F2)
            .setFooter({ text: `Prefix: ${prefix}` });
        
        await interaction.reply({ embeds: [embed] });
    }
    
    else if (commandName === 'stats') {
        const stats = Logger.getStats();
        
        const embed = new EmbedBuilder()
            .setTitle('📈 Bot Statistics')
            .setColor(0x5865F2)
            .addFields(
                { name: 'Uptime', value: stats.uptime, inline: true },
                { name: 'Commands Executed', value: stats.totalCommands.toString(), inline: true },
                { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true }
            );
        
        await interaction.reply({ embeds: [embed] });
    }
});

client.on('error', (error) => {
    Logger.log('ERROR', `Discord Client Error: ${error.message}`, error);
});

client.on('warn', (warning) => {
    Logger.log('WARNING', `Discord Client Warning: ${warning}`);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.log('ERROR', `Unhandled Promise Rejection: ${reason}`, { promise });
});

process.on('uncaughtException', (error) => {
    Logger.log('ERROR', `Uncaught Exception: ${error.message}`, error);
    process.exit(1);
});

Logger.log('SYSTEM', '══════════════════════════════════════════════════════════');
Logger.log('SYSTEM', '🚀 STARTING DISCORD BOT - INITIALIZING CONNECTION');
Logger.log('SYSTEM', '══════════════════════════════════════════════════════════');
Logger.log('INFO', `Environment: ${process.env.NODE_ENV || 'production'}`);
Logger.log('INFO', `Starting time: ${new Date().toISOString()}`);
Logger.log('DEBUG', `Token present: ${!!TOKEN}`);
Logger.log('DEBUG', `Guild ID: ${GUILD_ID || 'Not set'}`);
Logger.log('DEBUG', `Client ID: ${CLIENT_ID || 'Not set'}`);

client.login(TOKEN).catch(err => {
    Logger.log('ERROR', '══════════════════════════════════════════════════════════');
    Logger.log('ERROR', '❌ BOT LOGIN FAILED!');
    Logger.log('ERROR', '══════════════════════════════════════════════════════════');
    Logger.log('ERROR', `Login Error: ${err.message}`);
    Logger.log('ERROR', `Error Stack: ${err.stack}`);
    Logger.log('ERROR', `Token Length: ${TOKEN ? TOKEN.length : 0}`);
    Logger.log('ERROR', `Token Preview: ${TOKEN ? TOKEN.substring(0, 10) + '...' : 'NO TOKEN'}`);
    Logger.log('ERROR', '══════════════════════════════════════════════════════════');
    
    setTimeout(() => {
        process.exit(1);
    }, 10000);
});
