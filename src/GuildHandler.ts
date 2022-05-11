import { Channel, Guild, GuildMember, GuildMemberRoleManager, Message, Role, ThreadChannel } from "discord.js";
import { ChannelHandler } from "./ChannelHandler";
const { Client } = require('discord.js');

export class GuildHandler {
    repeats: number = 0;
    response: string = "pls stop";
    muteTime: number = 0;
    guild: Guild;
 
    // Channels, roles, and users are all stored by ID
    channels: Set<string>; 
    roles: Set<string>; 
    users: Set<string>; 

    constructor(guild: Guild) {
        this.guild = guild;
        this.users = new Set<string>([guild.ownerId]);
        this.roles = new Set<string>();
        this.channels = new Set<string>();
    }

    // Helper functions for commands
    checkChangeSuccess(old: any, updated: any, message: Message): void {
        if (old === updated) {
            message.channel.send(`Change successful!`)
        }
        else {
            message.channel.send(`Sorry, something went wrong. Please try again.`);
        }
    }



    //
    //
    // Commands
    setRepeats(arg: string, message: Message): void {
        let newRepeat: number = Number(arg);

        if (isNaN(newRepeat)) {
            message.channel.send("This command requires a number as it's argument.");
            return;
        }

        this.repeats = newRepeat;
        this.checkChangeSuccess(this.repeats, newRepeat, message);
    }

    setResponse(arg: string, message: Message): void {
        this.response = arg;
        this.checkChangeSuccess(this.response, arg, message);
    }

    addChannel(arg: string, message: Message): void {
        let changed: boolean = false;

        this.guild.channels.cache.forEach((channel) => {
            if (channel.name === arg) {
                this.channels.add(channel.id);
                changed = true;
                return;
            }
        });
        
        if (changed) {
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, we couldn't find that channel on your server, please try again.");
        }
    }

    removeChannel (arg: string, message: Message): void {
        let changed: boolean = false;
        let id: string = "";

        this.guild.channels.cache.forEach((channel) => {
            if (channel.name === arg) {
                id = channel.id;
                return;
            }
        });

        if (this.channels.has(id)) {
            this.channels.delete(id);
            changed = true;
        }
        
        if (changed) {
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, you haven't added the bot to this channel.");
        }
    }


    //
    //
    // Command Handling
    prefix: string = "-ihs ";
    isCommand(message: Message): boolean {
        return message.content.toLowerCase().startsWith(this.prefix);
    }

    validateUser(message: Message): boolean {
        if (message.author.id === this.guild.ownerId) {
            return true;
        }

        if (this.users.has(message.author.id)) {
            return true;
        }

        // TODO: test later
        let guildMember: GuildMember = this.guild.members.cache.get(message.author.id) as GuildMember;
        guildMember.roles.cache.forEach((role: Role) => {
            if (this.roles.has(role.id)) return true;
        });

        return false;
    }

    parseCommand(message: Message): void {
        if (!this.validateUser(message)) return;

        let command: string = message.content.substring(this.prefix.length);

        if (command.startsWith("repeats ")) {
            this.setRepeats(command.substring("repeats ".length), message);
        }
        else if (command.startsWith("response ")) {
            this.setResponse(command.substring("response ".length), message);
        }
        else if (command.startsWith("addChannel ")) {
            this.addChannel(command.substring("addChannel ".length), message);
        }
        else if (command.startsWith("removeChannel ")) {
            this.removeChannel(command.substring("removeChannel ".length), message);
        }
        else if (command.startsWith("addRole ")) {

        }
        else if (command.startsWith("removeRole ")) {

        }
        else if (command.startsWith("addUser ")) {

        }
        else if (command.startsWith("removeUser ")) {

        }
        else if (command.startsWith("muteTime ")) {

        }
        else {
            message.channel.send("Sorry, that's not a valid command.");
        }

    }

}