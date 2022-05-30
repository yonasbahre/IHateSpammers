import { Guild, GuildManager, Message, Snowflake } from "discord.js";
import { ChannelHandler } from "./ChannelHandler";
import { GuildHandler } from "./GuildHandler";

require("dotenv").config();
const { Client, Intents } = require('discord.js');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/ihs", () => {console.log("Connected to database.")});


const client = new Client( {intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]} );
let guilds = new Map<Snowflake, GuildHandler>();

const removeGuild = (id: string): void => {
    guilds.delete(id);
    console.log(guilds.size);
}

client.login(process.env.TOKEN);

// Startup tasks for bot
client.on("ready", () => {
    console.log(`Bot is online! Logged in as ${client.user.tag}.`);

    // Instantiate GuildHandlers for each Guild the bot is in
    client.guilds.cache.forEach((guild: Guild) => {
        guilds.set(guild.id, new GuildHandler(guild, client.user));
    });

    guilds.forEach((guild: GuildHandler) => {
        guild.loadFromDB();
    });
});

// Handle on Guild Join/Delete
client.on("guildCreate", (guild: Guild) => {
    guilds.set(guild.id, new GuildHandler(guild, client.user));
    guilds.get(guild.id)?.addToDB();
});

client.on("guildDelete", (guild: Guild) => {
    guilds.get(guild.id)?.removeFromDB();
    guilds.delete(guild.id);
})


// Message parser
client.on("message", (message: Message) => {
    if (message.author.bot) return;
    let guildHandler: GuildHandler | undefined = guilds.get(message.guildId as string);
    
    // Handle if message is a command
    if (guildHandler?.isCommand(message)) {
        guildHandler.parseCommand(message);
        return;
    }

    // Check if spam
    if (guildHandler?.channels.has(message.channelId)) {
        let channelHandler: ChannelHandler = guildHandler.channels.get(message.channelId) as ChannelHandler;
        channelHandler.checkMessage(message);
    }
    
});