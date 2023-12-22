import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";

export type MemberDocument = HydratedDocument<Member>;

@Schema()
export class Member {
    @Prop({ required: true })
    connected: boolean;

    @Prop({ required: true })
    isHost: boolean;

    @Prop({ required: true })
    name: string;

    @Prop()
    socketId: string;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
