require("dotenv").config();
const { Client, Intents } = require('discord.js');

const client = new Client( {intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]} );
client.login(process.env.TOKEN);

client.on("ready", () => {
    console.log("Mission control, our bot is go flight!");
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", (message: any) => {
    if (message.author.bot) return;
    message.channel.send("https://c.tenor.com/N_5w43i-o4wAAAAC/omg-gimzie.gif");
});