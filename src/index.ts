import { Guild, GuildManager, Message, Snowflake } from "discord.js";
import { ChannelHandler } from "./ChannelHandler";
import { GuildHandler } from "./GuildHandler";

require("dotenv").config();
const { Client, Intents } = require('discord.js');

const client = new Client( {intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]} );
let guilds = new Map<Snowflake, GuildHandler>();

client.login(process.env.TOKEN);

// Startup tasks for bot
client.on("ready", () => {
    console.log(`Bot is online! Logged in as ${client.user.tag}.`);

    // Instantiate GuildHandlers for each Guild the bot is in
    client.guilds.cache.forEach((guild: Guild) => {
        guilds.set(guild.id, new GuildHandler(guild));
    });
});

client.on("message", (message: Message) => {
    if (message.author.bot) return;
    let guildHandler: GuildHandler | undefined = guilds.get(message.guildId as string);
    
    // Handle if message is a command
    if (guildHandler?.isCommand(message)) {
        guildHandler.parseCommand(message);
        // message.channel.send("Command processed.");
        return;
    }

    // Check if spam
    if (guildHandler?.channels.has(message.channelId)) {
        let channelHandler: ChannelHandler = guildHandler.channels.get(message.channelId) as ChannelHandler;
        channelHandler.checkMessage(message);
    }
    
});