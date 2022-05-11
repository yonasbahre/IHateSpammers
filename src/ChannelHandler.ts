import { Guild, Message } from "discord.js";
import { GuildHandler } from "./GuildHandler";
const { Client } = require('discord.js');

export class ChannelHandler {
    prevMsg: string = "";
    currMsg: string = "";
    repeatCount: number = 1;
    guildHandler: GuildHandler;

    constructor(guildHandler: GuildHandler) {
        this.guildHandler = guildHandler;
    }

    checkMessage(message: Message): void {
        this.prevMsg = this.currMsg;
        this.currMsg = message.content;

        (this.prevMsg !== this.currMsg ? this.repeatCount = 1: this.repeatCount++);

        if (this.repeatCount === this.guildHandler.repeats) {
            this.respond(message);
            this.repeatCount = 1;
        }

    }

    respond(message: Message): void {
        message.channel.send(this.guildHandler.response);
    }
}