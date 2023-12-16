import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type RoomDocument = HydratedDocument<Room>;

@Schema()
export class Room {
    @Prop()
    maxUsers: number;

    @Prop({ required: true })
    passphrase: string;

    @Prop({ required: true })
    roomOwnerId: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
