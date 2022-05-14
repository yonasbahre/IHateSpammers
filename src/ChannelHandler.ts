import { DiscordAPIError, Guild, GuildMember, Message, Role } from "discord.js";
import { GuildHandler } from "./GuildHandler";
const { Client } = require('discord.js');

export class ChannelHandler {
    prevMsg: string = "";
    prevUser: GuildMember | null = null;
    currMsg: string = "";
    currUser: GuildMember | null = null;
    repeatCount: number = 1;
    spammers: Set<GuildMember>;
    guildHandler: GuildHandler;

    constructor(guildHandler: GuildHandler) {
        this.guildHandler = guildHandler;
        this.spammers = new Set<GuildMember>();
    }

    checkMessage(message: Message): void {
        this.prevMsg = this.currMsg;
        this.prevUser = this.currUser;
        this.currMsg = message.content;
        this.currUser = message.member;

        if (this.prevMsg !== this.currMsg && this.guildHandler.repeats !== 1) {
            this.repeatCount = 1;
            this.spammers.clear();
        }
        else {
            this.repeatCount++;
            if (this.prevUser) this.spammers.add(this.prevUser);
            if (this.currUser) this.spammers.add(this.currUser);
        }

        if (this.repeatCount >= this.guildHandler.repeats && this.guildHandler.repeats !== 0) {
            this.respond(message);
        }

    }

    respond(message: Message): void {
        message.channel.send(this.guildHandler.response);

        // timeout spammers
        let botHighest: Role = this.guildHandler.botMember.roles.highest;   // highest role the bot has
        this.spammers.forEach((spammer: GuildMember) => {
            if (spammer.id != this.guildHandler.guild.ownerId && botHighest.comparePositionTo(spammer.roles.highest) > 0) {
                spammer.timeout(this.guildHandler.muteTime * 60 * 1000);
            }
            else {
                console.log(`Unable to timeout ${spammer.user.tag} as their role is too high`);
            }
        });
        
        this.repeatCount = 1;
        this.currMsg = "";
        this.spammers.clear();
    }

}