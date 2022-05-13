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
            try {
                spammer.timeout(this.guildHandler.muteTime * 60 * 1000);
            } catch (error: any) {
                if (spammer.id === this.guildHandler.guild.ownerId) {
                    console.log("Failed attempt to timeout guild owner.");
                }
                else {
                    console.log("Unknown timeout error occurred.");
                }
            }
        });
        
        this.repeatCount = 1;
        this.spammers.clear();
    }

    // Handling mutes:
    // Collect offender list
    // On response, timeout() them
    
    // For each message, get guildMember object
    // Add to set if repeat
    // When repeats limit reached, forEach guildMember, timeout muteTime * 60 * 1000
}