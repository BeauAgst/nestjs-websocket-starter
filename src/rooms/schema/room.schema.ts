import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type RoomDocument = HydratedDocument<Room>;

@Schema({ collection: "rooms", timestamps: true })
export class Room {
    @Prop()
    createdAt: Date;

    @Prop()
    maxUsers?: number;

    @Prop({ required: true })
    passphrase: string;

    @Prop({ required: true })
    roomOwnerId: string;

    @Prop({ required: true })
    users: string[];

    @Prop()
    updatedAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
