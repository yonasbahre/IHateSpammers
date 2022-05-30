import { Channel, Guild, GuildChannel, GuildMember, GuildMemberRoleManager, Message, Role, ThreadChannel, User } from "discord.js";
import { ChannelHandler } from "./ChannelHandler";
const { Client } = require('discord.js');
import { Model } from "mongoose";
import GuildModel from "./GuildModel";


export class GuildHandler {
    repeats: number = 0;
    response: string = "pls stop";
    muteTime: number = 0;
    guild: Guild;
    botMember: GuildMember;
 
    channels: Map<string, ChannelHandler>;  // key is channel ID
    roles: Set<string>;                     // key is role name
    users: Set<string>;                     // key is user tag

    constructor(guild: Guild, botUser: User) {
        this.guild = guild;
        this.users = new Set<string>();
        this.roles = new Set<string>();
        this.channels = new Map<string, ChannelHandler>();
        this.botMember = this.guild.members.cache.get(botUser.id) as GuildMember;
    }



    //
    //
    // Database Handling
    async addToDB(): Promise<void> {
        await GuildModel.create({
            _id: this.guild.id,
            repeats : this.repeats,
            response: this.response,
            muteTime: this.muteTime,
            channels: Array.from(this.channels.values()),
            roles: Array.from(this.roles.values()),
            users: Array.from(this.users.values())
        });
    }

    async removeFromDB(): Promise<void> {
        await GuildModel.deleteOne({_id: this.guild.id});
    }

    async loadFromDB(): Promise<void> {
        let exists = await GuildModel.exists({_id: this.guild.id});

        if (!exists) {
            console.log(`New guild ${this.guild.name} detected! Adding to database.`);
            this.addToDB();
        }
        else {
            console.log(`Guild ${this.guild.name} already in database. Loading.`);
            const query: any = await GuildModel.find({_id: this.guild.id});
            if (query.length) {
                console.log(`(Before) repeats: ${this.repeats}`);
                this.repeats = query[0].repeats;
                this.response = query[0].response;
                this.muteTime = query[0].muteTime;
                this.channels = new Map(query[0].channels?.map((channel: string) => {
                    return [channel, new ChannelHandler(this)]
                }));
                this.roles = new Set(query[0].roles);
                this.users = new Set(query[0].users);
                console.log(`(After) repeats: ${this.repeats}`);
            }
        }
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
    async setRepeats(arg: string, message: Message): Promise<void> {
        let newRepeat: number = Number(arg);

        if (isNaN(newRepeat)) {
            message.channel.send("This command requires a number as its argument.");
            return;
        }

        this.repeats = newRepeat;
        await GuildModel.updateOne({_id: this.guild.id}, {$set: {repeats: this.repeats}});

        this.checkChangeSuccess(this.repeats, newRepeat, message);
    }

    async setResponse(arg: string, message: Message): Promise<void> {
        this.response = arg;
        await GuildModel.updateOne({_id: this.guild.id}, {$set: {response: this.response}});
        this.checkChangeSuccess(this.response, arg, message);
    }

    async addChannel(arg: string, message: Message): Promise<void> {
        let changed: boolean = false;
        let channelID: string = "";

        this.guild.channels.cache.forEach((channel: GuildChannel | ThreadChannel) => {
            if (channel.name === arg) {
                channelID = channel.id;
                this.channels.set(channel.id, new ChannelHandler(this));
                changed = true;
                return;
            }
        });
        

        if (changed) {
            await GuildModel.updateOne({_id: this.guild.id}, {$push: {channels: channelID}});
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, we couldn't find that channel on your server, please try again.");
        }
    }

    async removeChannel (arg: string, message: Message): Promise<void> {
        let changed: boolean = false;
        let channelID: string = "";

        this.guild.channels.cache.forEach((channel: GuildChannel | ThreadChannel) => {
            if (channel.name === arg) {
                channelID = channel.id;
                return;
            }
        });

        if (this.channels.has(channelID)) {
            this.channels.delete(channelID);
            await GuildModel.updateOne({_id: this.guild.id}, {$pull: {channels: channelID}});
            changed = true;
        }
        
        if (changed) {
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, you haven't added the bot to this channel.");
        }
    }

    async addRole (arg: string, message: Message): Promise<void> {
        let changed: boolean = false;
        this.guild.roles.cache.forEach((role: Role) => {
            if (role.name.toLowerCase() === arg.toLowerCase()) {
                this.roles.add(role.name);
                changed = true;
                return;
            }
        });

        if (changed) {
            await GuildModel.updateOne({_id: this.guild.id}, {$push: {roles: arg}});
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, we couldn't find that role! Please try again.");
        }
    }

    async removeRole (arg: string, message: Message): Promise<void> {
        let changed: boolean = false;
        let name: string = "";
        this.guild.roles.cache.forEach((role: Role) => {
            if (role.name === arg) name = role.name;
        });

        if (this.roles.has(name)) {
            this.roles.delete(name);
            await GuildModel.updateOne({_id: this.guild.id}, {$pull: {roles: arg}});
            changed = true;
        }

        if (changed) {
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, we weren't able to remove that role.");
        }
    }

    async addUser (arg: string, message: Message): Promise<void> {
        this.users.add(arg);

        if (this.users.has(arg)) {
            await GuildModel.updateOne({_id: this.guild.id}, {$push: {users: arg}});
            message.channel.send("Changed successfully!");
        }
        else {
            message.channel.send("Sorry, we weren't able to add that user. Please try again.");
        }
    }

    async removeUser (arg: string, message: Message): Promise<void> {
        if (this.users.has(arg)) {
            this.users.delete(arg);

            if (!this.users.has(arg)) {
                await GuildModel.updateOne({_id: this.guild.id}, {$pull: {users: arg}});
                message.channel.send("Changed successfully!");
            }
            else {
                message.channel.send("Sorry, we weren't able to add that user. Please try again.");
            }
        }
    }

    async setMuteTime (arg: string, message: Message): Promise<void> {
        let newMuteTime: number = Number(arg);

        if (isNaN(newMuteTime)) {
            message.channel.send("This command requires a number as its argument.");
            return;
        }

        this.muteTime = newMuteTime;
        await GuildModel.updateOne({_id: this.guild.id}, {$set: {muteTime: this.muteTime}});
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
        if (message.author.id === this.guild.ownerId) return true;
        if (this.users.has(message.author.tag)) return true;

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