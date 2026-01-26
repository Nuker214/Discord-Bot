const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const TOKEN = process.env.TOKEN;

// Create client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Web server (for UptimeRobot)
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive.");
});

app.listen(3000, () => {
  console.log("Web server running.");
});

// Ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  // No status set here
});

// Login
client.login(TOKEN);
