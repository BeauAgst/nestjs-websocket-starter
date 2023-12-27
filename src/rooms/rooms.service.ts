import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { nanoid } from "nanoid";
import { PinoLogger } from "nestjs-pino";
import { UserException } from "src/common/user.exception";
import { RoomState } from "src/model/enum/room-state.enum";

import type { CreateRoomInput } from "./dto/create-room.input";
import type { JoinRoomInput } from "./dto/join-room.input";
import type { MemberDocument } from "./schema/member.schema";
import { Member } from "./schema/member.schema";
import { Room } from "./schema/room.schema";
import { generateRoomCode } from "./util/generate-room-code";

@Injectable()
export class RoomsService {
    constructor(
        private readonly logger: PinoLogger,
        @InjectModel(Room.name) private roomModel: Model<Room>,
        @InjectModel(Member.name) private readonly memberModel: Model<Member>,
    ) {
        this.logger.setContext(this.constructor.name);
    }

    async getByCode(code: string) {
        return await this._findOne({ code: code.toUpperCase() });
    }

    async getByMemberId(memberId: string): Promise<Room> {
        return await this._findOne({ "members._id": new mongoose.Types.ObjectId(memberId) });
    }

    private async addMemberToRoom(id: string, member: Member) {
        return await this._findOneAndUpdate(
            { _id: id },
            {
                $push: { members: member },
            },
        );
    }

    async create(input: CreateRoomInput): Promise<Room> {
        const member = new this.memberModel({
            connected: false,
            name: input.name,
            isHost: true,
            socketId: null,
        });

        const room = new this.roomModel({
            code: generateRoomCode(),
            isLocked: false,
            maxMembers: input.maxMembers,
            members: [member],
            secret: nanoid(),
            state: RoomState.Created,
        });
        await room.save();

        return this.getByCode(room.code);
    }

    async join(code: string, input: JoinRoomInput): Promise<MemberDocument> {
        const room = await this.getByCode(code);
        if (!room) throw new UserException("Invalid room code");

        if (input.memberId) {
            const existingMember = room.members.find(
                (member) => member._id.toHexString() === input.memberId,
            );
            if (existingMember) return existingMember;
        }

        const member = new this.memberModel({
            connected: false,
            isHost: false,
            name: input.name,
            socketId: undefined,
        });

        await this.addMemberToRoom(room.id, member);

        return member;
    }

    delete(code: string) {
        return this.roomModel.deleteOne({ code });
    }

    private _findOne(conditions: unknown) {
        return this.roomModel.findOne(conditions).exec();
    }

    private _findOneAndUpdate(conditions, update) {
        return this.roomModel.findOneAndUpdate(conditions, update, { new: true });
    }
}
