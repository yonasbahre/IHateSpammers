import { Document, Schema, model } from 'mongoose';

interface Guild extends Document {
    _id: String;
    repeats: Number;
    response: String;
    muteTime: Number;
    channels: [String];
    roles: [String];
    users: [String];
}

const GuildSchema: Schema = new Schema({
    _id: String,
    repeats: Number,
    response: String,
    muteTime: Number,
    channels: [String],
    roles: [String],
    users: [String]
});

export default model<Guild>("Guild", GuildSchema);
