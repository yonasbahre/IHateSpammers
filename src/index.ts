import { Message } from "discord.js";
import { ChannelHandler } from "./ChannelHandler";
import { GuildHandler } from "./GuildHandler";

require("dotenv").config();
const { Client, Intents } = require('discord.js');

const client = new Client( {intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]} );
let guilds: GuildHandler[];

client.login(process.env.TOKEN);

// Startup tasks for bot
client.on("ready", () => {
    console.log(`Bot is online! Logged in as ${client.user.tag}.`);

    // Instantiate GuildHandlers for each Guild the bot is in
});

client.on("message", (message: Message) => {
    if (message.author.bot) return;

    // Check if command
    // Check if spam
    
    // delete later, print test?
    if (message.content.includes("do you hate spammers")) {
        message.channel.send("yes");
    }
});