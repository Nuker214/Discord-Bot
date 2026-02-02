const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ChannelType, REST, Routes, ActivityType } = require('discord.js');

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
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ]
});

// GLOBAL STORAGE
let welcomeChannel = null;
let leaveChannel = null;
const prefix = '.';

// CUSTOM FONT FUNCTION (Better Discord Font)
function applyCustomFont(text) {
    const fontMap = {
        // Small caps style - cleaner for Discord
        'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ꜰ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ', 'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ',
        'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ', 'S': 'ꜱ', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ',
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ',
        'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 'ꜱ', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
        '0': '𝟢', '1': '𝟣', '2': '𝟤', '3': '𝟥', '4': '𝟦', '5': '𝟧', '6': '𝟨', '7': '𝟩', '8': '𝟪', '9': '𝟫'
    };
    
    return text.split('').map(char => fontMap[char] || char).join('');
}

// Generate gradient colors from start to end
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

// RANKING ROLES WITH SMOOTH GRADIENT FROM YELLOW TO RED
const GRADIENT_COLORS = generateGradientColors("#FFFF00", "#FF0000", 22); // Yellow to Red gradient

const RANKING_ROLES = [
    // Observer Series - Light Yellow
    { name: applyCustomFont("Observer I"), color: GRADIENT_COLORS[0] },
    { name: applyCustomFont("Observer II"), color: GRADIENT_COLORS[0] },
    { name: applyCustomFont("Observer III"), color: GRADIENT_COLORS[0] },
    
    // Initiate Series - Yellow
    { name: applyCustomFont("Initiate I"), color: GRADIENT_COLORS[2] },
    { name: applyCustomFont("Initiate II"), color: GRADIENT_COLORS[2] },
    { name: applyCustomFont("Initiate III"), color: GRADIENT_COLORS[2] },
    
    // Novitiate Series
    { name: applyCustomFont("Novitiate I"), color: GRADIENT_COLORS[4] },
    { name: applyCustomFont("Novitiate II"), color: GRADIENT_COLORS[4] },
    { name: applyCustomFont("Novitiate III"), color: GRADIENT_COLORS[4] },
    
    // Apprentice Series
    { name: applyCustomFont("Apprentice I"), color: GRADIENT_COLORS[6] },
    { name: applyCustomFont("Apprentice II"), color: GRADIENT_COLORS[6] },
    { name: applyCustomFont("Apprentice III"), color: GRADIENT_COLORS[6] },
    
    // Intermediate Series
    { name: applyCustomFont("Intermediate I"), color: GRADIENT_COLORS[8] },
    { name: applyCustomFont("Intermediate II"), color: GRADIENT_COLORS[8] },
    { name: applyCustomFont("Intermediate III"), color: GRADIENT_COLORS[8] },
    
    // Practitioner Series
    { name: applyCustomFont("Practitioner I"), color: GRADIENT_COLORS[10] },
    { name: applyCustomFont("Practitioner II"), color: GRADIENT_COLORS[10] },
    { name: applyCustomFont("Practitioner III"), color: GRADIENT_COLORS[10] },
    
    // Proficient Series
    { name: applyCustomFont("Proficient I"), color: GRADIENT_COLORS[12] },
    { name: applyCustomFont("Proficient II"), color: GRADIENT_COLORS[12] },
    { name: applyCustomFont("Proficient III"), color: GRADIENT_COLORS[12] },
    
    // Advanced Series
    { name: applyCustomFont("Advanced I"), color: GRADIENT_COLORS[14] },
    { name: applyCustomFont("Advanced II"), color: GRADIENT_COLORS[14] },
    { name: applyCustomFont("Advanced III"), color: GRADIENT_COLORS[14] },
    
    // Experienced Series
    { name: applyCustomFont("Experienced I"), color: GRADIENT_COLORS[16] },
    { name: applyCustomFont("Experienced II"), color: GRADIENT_COLORS[16] },
    { name: applyCustomFont("Experienced III"), color: GRADIENT_COLORS[16] },
    
    // Advanced Practitioner Series
    { name: applyCustomFont("Advanced Practitioner I"), color: GRADIENT_COLORS[17] },
    { name: applyCustomFont("Advanced Practitioner II"), color: GRADIENT_COLORS[17] },
    { name: applyCustomFont("Advanced Practitioner III"), color: GRADIENT_COLORS[17] },
    
    // Ascendant Series
    { name: applyCustomFont("Ascendant I"), color: GRADIENT_COLORS[18] },
    { name: applyCustomFont("Ascendant II"), color: GRADIENT_COLORS[18] },
    { name: applyCustomFont("Ascendant III"), color: GRADIENT_COLORS[18] },
    
    // Transcendent Series
    { name: applyCustomFont("Transcendent I"), color: GRADIENT_COLORS[19] },
    { name: applyCustomFont("Transcendent II"), color: GRADIENT_COLORS[19] },
    { name: applyCustomFont("Transcendent III"), color: GRADIENT_COLORS[19] },
    
    // Luminary Series
    { name: applyCustomFont("Luminary I"), color: GRADIENT_COLORS[20] },
    { name: applyCustomFont("Luminary II"), color: GRADIENT_COLORS[20] },
    { name: applyCustomFont("Luminary III"), color: GRADIENT_COLORS[20] },
    
    // Prime Series - Dark Red
    { name: applyCustomFont("Ascendant Prime I"), color: GRADIENT_COLORS[21] },
    { name: applyCustomFont("Ascendant Prime II"), color: GRADIENT_COLORS[21] },
    { name: applyCustomFont("Ascendant Prime III"), color: GRADIENT_COLORS[21] },
    { name: applyCustomFont("Transcendent Prime I"), color: "#990000" },
    { name: applyCustomFont("Transcendent Prime II"), color: "#990000" },
    { name: applyCustomFont("Transcendent Prime III"), color: "#990000" },
    { name: applyCustomFont("Luminary Prime I"), color: "#660000" },
    { name: applyCustomFont("Luminary Prime II"), color: "#660000" },
    { name: applyCustomFont("Luminary Prime III"), color: "#660000" },
    
    // Eternal Series - Darker Red
    { name: applyCustomFont("Luminary Eternal I"), color: "#330000" },
    { name: applyCustomFont("Luminary Eternal II"), color: "#330000" },
    { name: applyCustomFont("Luminary Eternal III"), color: "#330000" },
    { name: applyCustomFont("Ascendant Eternal I"), color: "#1A0000" },
    { name: applyCustomFont("Ascendant Eternal II"), color: "#1A0000" },
    { name: applyCustomFont("Ascendant Eternal III"), color: "#1A0000" },
    { name: applyCustomFont("Transcendent Eternal I"), color: "#000000" },
    { name: applyCustomFont("Transcendent Eternal II"), color: "#000000" },
    { name: applyCustomFont("Transcendent Eternal III"), color: "#000000" },
    
    // Ultimate Series - Black
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

// CHANNEL STRUCTURE WITH CUSTOM FONT
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

// ALL ROLES TO CREATE WITH CUSTOM FONT AND GRADIENT COLORS
const ALL_ROLES = [
    // Partial Access - Blue Gradient
    { name: applyCustomFont("Partial Access Members"), color: "#1E90FF" },
    { name: applyCustomFont("Partial Access Allies"), color: "#4169E1" },
    { name: applyCustomFont("Partial Access Training"), color: "#6495ED" },
    { name: applyCustomFont("Partial Access Misc"), color: "#4682B4" },
    { name: applyCustomFont("Partial Access Information"), color: "#5F9EA0" },
    
    // Access Roles - Green Gradient
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
    
    // Status Roles
    { name: applyCustomFont("Enemies"), color: "#FF0000" },
    { name: applyCustomFont("Traitor"), color: "#8B0000" },
    { name: applyCustomFont("Trusted"), color: "#9370DB" },
    { name: applyCustomFont("Friends"), color: "#8A2BE2" },
    { name: applyCustomFont("Emojis Permissions"), color: "#FFD700" },
    { name: applyCustomFont("Stickers Permissions"), color: "#FFA500" },
    { name: applyCustomFont("Gifs Permissions"), color: "#FF8C00" },
    { name: applyCustomFont("Image Permissions"), color: "#FF6347" },
    { name: applyCustomFont("Slowmode Bypass"), color: "#FF4500" },
    
    // Leadership
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
    
    // Special
    { name: applyCustomFont("Bots"), color: "#2F4F4F" },
    { name: applyCustomFont("Scripter"), color: "#FF8C00" },
    { name: applyCustomFont("Coder"), color: "#FF7F50" },
    { name: applyCustomFont("Evaluation Access"), color: "#FF6347" },
    
    // VERIFICATION ROLES (Will be auto-assigned)
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

// BOT READY EVENT WITH RICH PRESENCE
client.once('ready', async () => {
    console.log(`╔══════════════════════════════════════════════════════════╗`);
    console.log(`║  🚀 Bot Online: ${client.user.tag}`);
    console.log(`║  📊 Servers: ${client.guilds.cache.size}`);
    console.log(`║  ⚙️  Prefix: ${prefix}`);
    console.log(`║  📝 Slash Commands: Enabled`);
    console.log(`╚══════════════════════════════════════════════════════════╝`);
    
    // SET RICH PRESENCE (Custom Status)
    const activities = [
        { name: `${prefix}help | Watching the server`, type: ActivityType.Watching },
        { name: `${client.guilds.cache.size} servers`, type: ActivityType.Listening },
        { name: 'Ranking System | Custom Font', type: ActivityType.Playing },
        { name: 'Managing roles & channels', type: ActivityType.Competing }
    ];
    
    let currentActivity = 0;
    
    // Update activity every 30 seconds
    setInterval(() => {
        client.user.setActivity(activities[currentActivity]);
        currentActivity = (currentActivity + 1) % activities.length;
    }, 30000);
    
    // Set initial activity
    client.user.setActivity(activities[0]);
    client.user.setStatus('online');
    
    // Register slash commands
    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        const commands = [
            {
                name: 'rolelist',
                description: 'Show all ranking roles'
            },
            {
                name: 'roleinfo',
                description: 'Show ranking information'
            },
            {
                name: 'claninfo',
                description: 'Show clan information'
            },
            {
                name: 'rules',
                description: 'Display server rules'
            },
            {
                name: 'kick',
                description: 'Kick a member',
                options: [
                    { name: 'member', description: 'Member to kick', type: 6, required: true },
                    { name: 'reason', description: 'Reason for kick', type: 3, required: false }
                ]
            },
            {
                name: 'ban',
                description: 'Ban a member',
                options: [
                    { name: 'member', description: 'Member to ban', type: 6, required: true },
                    { name: 'reason', description: 'Reason for ban', type: 3, required: false }
                ]
            },
            {
                name: 'mute',
                description: 'Mute a member',
                options: [
                    { name: 'member', description: 'Member to mute', type: 6, required: true },
                    { name: 'reason', description: 'Reason for mute', type: 3, required: false }
                ]
            }
        ];
        
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('✅ Slash commands registered!');
    } catch (err) {
        console.log('⚠️ Could not register slash commands:', err.message);
    }
});

// WELCOME EVENT - AUTO-ASSIGN VERIFICATION ROLES
client.on('guildMemberAdd', async member => {
    console.log(`👋 New member: ${member.user.tag} (${member.id})`);
    
    // AUTO-ASSIGN THE 3 VERIFICATION ROLES
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
            console.log(`✅ Auto-assigned verification roles to ${member.user.tag}`);
            
            // Send DM with instructions
            try {
                const welcomeDM = new EmbedBuilder()
                    .setTitle('👋 Welcome to the Server!')
                    .setDescription(`Hello ${member.user.username}! Welcome to our community.`)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '📋 Next Steps', value: '1. Check #rules\n2. Complete verification\n3. Agree to guidelines\n4. Get started!' },
                        { name: '🎯 Auto-Assigned Roles', value: 'You have been automatically assigned:\n• Verification Needed\n• Agreement Needed\n• Evaluation Needed\n\nPlease complete these requirements to gain full access.' }
                    )
                    .setFooter({ text: 'Server Staff' })
                    .setTimestamp();
                
                await member.send({ embeds: [welcomeDM] });
            } catch (dmError) {
                console.log('⚠️ Could not send welcome DM');
            }
        }
    } catch (roleError) {
        console.error('❌ Error auto-assigning roles:', roleError.message);
    }
    
    // SEND WELCOME MESSAGE IN CHANNEL
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
                        { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
                        { name: 'Verification', value: 'Please complete verification to access the server fully!', inline: false }
                    )
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'We hope you enjoy your stay!' })
                    .setTimestamp();

                await channel.send({ content: `${member}`, embeds: [embed] });
            }
        } catch (error) {
            console.error('❌ Error in welcome event:', error);
        }
    }
});

// LEAVE EVENT
client.on('guildMemberRemove', async member => {
    console.log(`👋 Member left: ${member.user.tag} (${member.id})`);
    
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
            console.error('❌ Error in leave event:', error);
        }
    }
});

// ALL PREFIX COMMANDS (17+ commands)
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const guild = message.guild;
    
    // COMMAND 1: .rolelistembed
    if (command === 'rolelistembed') {
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
            
            embed.addFields({
                name: '🎨 Color Gradient',
                value: 'Yellow → Orange → Red → Dark Red → Black\nEach color represents a progression level.',
                inline: false
            });
        }
        
        const pingRoles = roles.first(5).map(r => r.toString()).join(' ');
        await message.channel.send({ content: pingRoles || '', embeds: [embed] });
    }
    
    // COMMAND 2: .roleinfoembed
    if (command === 'roleinfoembed') {
        const embed = new EmbedBuilder()
            .setTitle('ℹ️ Role Information')
            .setDescription('Complete ranking system explanation:')
            .setColor(0x2ECC71)
            .addFields(
                { name: '🟡 Beginner Ranks', value: 'Observer → Initiate → Novitiate → Apprentice', inline: false },
                { name: '🟠 Intermediate Ranks', value: 'Intermediate → Practitioner → Proficient', inline: false },
                { name: '🔴 Advanced Ranks', value: 'Advanced → Experienced → Advanced Practitioner', inline: false },
                { name: '⚫ Elite Ranks', value: 'Ascendant → Transcendent → Luminary', inline: false },
                { name: '🌟 Prime & Eternal', value: 'Prime levels show mastery, Eternal shows legendary status', inline: false },
                { name: '👑 Ultimate Ranks', value: 'Omniscient → Nexithal → Zethithal (Highest achievable)', inline: false }
            )
            .setFooter({ text: 'Progression requires evaluation and activity' });
        
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 3: .claninfoembed
    if (command === 'claninfoembed') {
        const embed = new EmbedBuilder()
            .setTitle('🏰 Clan Information')
            .setDescription('Welcome to our community!')
            .setColor(0xF1C40F)
            .addFields(
                { name: 'About Us', value: 'Dedicated group focused on growth, teamwork, and excellence.', inline: false },
                { name: 'Our Mission', value: 'Create supportive environment for skill development.', inline: false },
                { name: 'Community Values', value: 'Respect • Teamwork • Learning • Positive Attitude', inline: false },
                { name: 'Get Started', value: '1. Read #rules\n2. Complete verification\n3. Agree to guidelines\n4. Participate!', inline: false }
            );
        
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 4: .Enablewelcomechat
    if (command === 'enablewelcomechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        welcomeChannel = message.channel.id;
        const embed = new EmbedBuilder()
            .setTitle('✅ Welcome Chat Enabled')
            .setDescription(`Welcome messages enabled in ${message.channel}`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 5: .Enableleavechat
    if (command === 'enableleavechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        leaveChannel = message.channel.id;
        const embed = new EmbedBuilder()
            .setTitle('✅ Leave Chat Enabled')
            .setDescription(`Leave messages enabled in ${message.channel}`)
            .setColor(0x00FF00);
        await message.channel.send({ embeds: [embed] });
    }
    
    // COMMAND 6: .Disablewelcomechat
    if (command === 'disablewelcomechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        welcomeChannel = null;
        await message.reply('✅ Welcome messages disabled');
    }
    
    // COMMAND 7: .Disableleavechat
    if (command === 'disableleavechat') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Administrator permission required!');
        }
        leaveChannel = null;
        await message.reply('✅ Leave messages disabled');
    }
    
    // COMMAND 8: .Rulesembed
    if (command === 'rulesembed') {
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
    
    // COMMAND 9: .Deleterankings
    if (command === 'deleterankings') {
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
    }
    
    // COMMAND 10: .Setuprankings
    if (command === 'setuprankings') {
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
        
        // Create verification roles too
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
    }
    
    // COMMAND 11: .Rolemake
    if (command === 'rolemake') {
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
    }
    
    // COMMAND 12: .Deleteroles
    if (command === 'deleteroles') {
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
    }
    
    // COMMAND 13: .Kick
    if (command === 'kick') {
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
        } catch (err) {
            message.reply(`❌ Failed: ${err.message}`);
        }
    }
    
    // COMMAND 14: .ban
    if (command === 'ban') {
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
        } catch (err) {
            message.reply(`❌ Failed: ${err.message}`);
        }
    }
    
    // COMMAND 15: .mute
    if (command === 'mute') {
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
        } catch (err) {
            message.reply(`❌ Failed: ${err.message}`);
        }
    }
    
    // COMMAND 16: .channelsmake
    if (command === 'channelsmake') {
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
    }
    
    // COMMAND 17: .channelsdelete
    if (command === 'channelsdelete') {
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
    }
    
    // VERIFICATION COMMANDS
    
    // .Verify
    if (command === 'verify') {
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
    
    // .Unverify
    if (command === 'unverify') {
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
    
    // .CheckAgreement
    if (command === 'checkagreement') {
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
    
    // .AllowAgreement
    if (command === 'allowagreement') {
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
    
    // .AllowAccess
    if (command === 'allowaccess') {
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
    
    // .RemoveAccess
    if (command === 'removeaccess') {
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

// SLASH COMMANDS
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    const { commandName, options } = interaction;
    const guild = interaction.guild;
    
    if (commandName === 'rolelist') {
        const roles = guild.roles.cache.filter(r => RANKING_ROLES.some(roleData => roleData.name === r.name));
        const embed = new EmbedBuilder()
            .setTitle('📊 Ranking Roles')
            .setDescription(`Total: ${roles.size} roles`)
            .setColor(0xFFD700);
        
        if (roles.size > 0) {
            const roleList = roles.first(20).map(r => r.toString()).join('\n');
            embed.addFields({ name: 'Roles', value: roleList });
        }
        
        await interaction.reply({ embeds: [embed] });
    }
    
    if (commandName === 'roleinfo') {
        const embed = new EmbedBuilder()
            .setTitle('ℹ️ Ranking System')
            .setColor(0x2ECC71)
            .addFields(
                { name: 'System', value: 'Yellow (Beginner) → Red (Advanced) → Black (Elite)' },
                { name: 'Progression', value: 'Complete evaluations to rank up' }
            );
        await interaction.reply({ embeds: [embed] });
    }
    
    if (commandName === 'claninfo') {
        const embed = new EmbedBuilder()
            .setTitle('🏰 Clan Info')
            .setColor(0xF1C40F)
            .addFields(
                { name: 'Welcome', value: 'Dedicated community focused on growth' },
                { name: 'Get Started', value: 'Complete verification and read rules' }
            );
        await interaction.reply({ embeds: [embed] });
    }
    
    if (commandName === 'rules') {
        const embed = new EmbedBuilder()
            .setTitle('📜 Rules')
            .setColor(0xFF0000)
            .addFields(
                { name: 'Basic Rules', value: 'Be respectful, no spam, follow Discord TOS' },
                { name: 'Conduct', value: 'Use proper channels and listen to staff' }
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
            await interaction.reply({ content: `✅ ${member} kicked`, ephemeral: true });
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
            await interaction.reply({ content: `✅ ${member} banned`, ephemeral: true });
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
        
        let muteRole = guild.roles.cache.find(r => r.name === applyCustomFont("Muted"));
        if (!muteRole) {
            try {
                muteRole = await guild.roles.create({
                    name: applyCustomFont("Muted"),
                    color: '#95a5a6',
                    reason: 'Mute role'
                });
            } catch (err) {
                return interaction.reply({ content: `❌ Failed to create role: ${err.message}`, ephemeral: true });
            }
        }
        
        try {
            await member.roles.add(muteRole);
            await interaction.reply({ content: `✅ ${member} muted`, ephemeral: true });
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
        console.error('❌ Token length:', TOKEN.length);
    }
    process.exit(1);
});
