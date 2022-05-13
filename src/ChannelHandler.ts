import { DiscordAPIError, Guild, GuildMember, Message } from "discord.js";
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

        if (this.prevMsg !== this.currMsg) {
            this.repeatCount = 1;
            this.spammers.clear();
        }
        else {
            this.repeatCount++;
            if (this.prevUser) this.spammers.add(this.prevUser);
            if (this.currUser) this.spammers.add(this.currUser);
        }

        if (this.repeatCount === this.guildHandler.repeats) {
            this.respond(message);
        }

    }

    respond(message: Message): void {
        message.channel.send(this.guildHandler.response);

        // timeout spammers
        this.spammers.forEach((spammer: GuildMember) => {
            if (this.guildHandler.botMember.roles.highest.comparePositionTo(spammer.roles.highest) > 0) {
                spammer.timeout(this.guildHandler.muteTime * 60 * 100);
            }
            else {
                console.log(`Unable to timeout ${spammer.user.tag} as their role is too high`);
            }
        });
        
        this.repeatCount = 1;
        this.spammers.clear();
    }

}