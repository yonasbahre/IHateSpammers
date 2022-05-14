import { Channel, Guild, GuildChannel, GuildMember, GuildMemberRoleManager, Message, Role, ThreadChannel, User } from "discord.js";
import { ChannelHandler } from "./ChannelHandler";
const { Client } = require('discord.js');

export class GuildHandler {
    repeats: number = 0;
    response: string = "pls stop";
    muteTime: number = 0;
    guild: Guild;
    botMember: GuildMember;
 
    // Channels and roles are stored by ID
    // Users are stored by tag
    channels: Map<string, ChannelHandler>;  // key is channel ID
    roles: Set<string>;                     // key is role name
    users: Set<string>;                     // key is user tag

    constructor(guild: Guild, botUser: User) {
        this.guild = guild;
        this.users = new Set<string>([guild.ownerId]);
        this.roles = new Set<string>();
        this.channels = new Map<string, ChannelHandler>();
        this.botMember = this.guild.members.cache.get(botUser.id) as GuildMember;
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
            message.channel.send("This command requires a number as its argument.");
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

        this.guild.channels.cache.forEach((channel: GuildChannel | ThreadChannel) => {
            if (channel.name === arg) {
                this.channels.set(channel.id, new ChannelHandler(this));
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

        this.guild.channels.cache.forEach((channel: GuildChannel | ThreadChannel) => {
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

    addRole (arg: string, message: Message): void {
        let changed: boolean = false;
        this.guild.roles.cache.forEach((role: Role) => {
            if (role.name.toLowerCase() === arg.toLowerCase()) {
                this.roles.add(role.name);
                changed = true;
                return;
            }
        });

        if (changed) {
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, we couldn't find that role! Please try again.");
        }
    }

    removeRole (arg: string, message: Message): void {
        let changed: boolean = false;
        let name: string = "";
        this.guild.roles.cache.forEach((role: Role) => {
            if (role.name === arg) name = role.name;
        });

        if (this.roles.has(name)) {
            this.roles.delete(name);
            changed = true;
        }

        if (changed) {
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, we weren't able to remove that role.");
        }
    }

    addUser (arg: string, message: Message): void {
        this.users.add(arg);

        if (this.users.has(arg)) {
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, we weren't able to add that user. Please try again.");
        }
    }

    removeUser (arg: string, message: Message): void {
        if (this.users.has(arg)) {
            this.users.delete(arg);
        }

        if (!this.users.has(arg)) {
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, we weren't able to add that user. Please try again.");
        }
    }

    setMuteTime (arg: string, message: Message): void {
        let newMuteTime: number = Number(arg);

        if (isNaN(newMuteTime)) {
            message.channel.send("This command requires a number as its argument.");
            return;
        }

        this.muteTime = newMuteTime;
        this.checkChangeSuccess(this.muteTime, newMuteTime, message);        
    }

    // Kicks bot from guild
    kickMe (message: Message): void {
        if (message.author.id !== this.guild.ownerId) {
            message.channel.send("Sorry, only the server owner can use this command.");
            return;
        }

        message.channel.send("Goodbye!");
        this.guild.leave();
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

        if (this.users.has(message.author.tag)) {
            return true;
        }

        // TODO: test later
        /*
        message.member?.roles.cache.forEach((role: Role) => {
            console.log(`Testing role ${role.name}`);
            if (this.roles.has(role.name)) return true;
            console.log(`No match found for role ${role.name}`);
        }); */

        let retval: boolean = false;
        let memberRoles = message.member?.roles.cache;
        if (memberRoles !== undefined) {
            for (let role of memberRoles.values()) {
                if (this.roles.has(role.name)) {
                    retval = true;
                    break;
                }
            }
        }

        return retval;
    }

    parseCommand(message: Message): void {
        if (!this.validateUser(message)) return;

        let command: string = message.content.substring(this.prefix.length);

        if (command.toLowerCase().startsWith("repeats ")) {
            this.setRepeats(command.substring("repeats ".length), message);
        }
        else if (command.toLowerCase().startsWith("response ")) {
            this.setResponse(command.substring("response ".length), message);
        }
        else if (command.toLowerCase().startsWith("addchannel ")) {
            this.addChannel(command.substring("addChannel ".length), message);
        }
        else if (command.toLowerCase().startsWith("removechannel ")) {
            this.removeChannel(command.substring("removeChannel ".length), message);
        }
        else if (command.toLowerCase().startsWith("addrole ")) {
            this.addRole(command.substring("addRole ".length), message);
        }
        else if (command.toLowerCase().startsWith("removerole ")) {
            this.removeRole(command.substring("removeRole ".length), message);
        }
        else if (command.toLowerCase().startsWith("adduser ")) {
            this.addUser(command.substring("addUser ".length), message);
        }
        else if (command.toLowerCase().startsWith("removeuser ")) {
            this.removeUser(command.substring("removeUser ".length), message);
        }
        else if (command.toLowerCase().startsWith("mutetime ")) {
            this.setMuteTime(command.substring("muteTime ".length), message);
        }
        else if (command.toLowerCase() === "kickme") {
            this.kickMe(message);
        }
        else {
            message.channel.send("Sorry, that's not a valid command.");
        }

    }

}