import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { nanoid } from "nanoid";
import { PinoLogger } from "nestjs-pino";
import { UserException } from "src/common/user.exception";
import { RoomState } from "src/model/enum/room-state.enum";

import type { ConnectToRoomInput } from "./dto/connect-to-room.input";
import type { CreateRoomInput } from "./dto/create-room.input";
import type { UpdateHostInput } from "./dto/give-host.input";
import type { JoinRoomInput } from "./dto/join-room.input";
import type { KickUserInput } from "./dto/kick-user.input";
import type { LeaveRoomInput } from "./dto/leave-room.input";
import type { LockRoomInput } from "./dto/look-room.input";
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

    async connect(socketId: string, input: ConnectToRoomInput): Promise<Room> {
        const { memberId, roomCode } = input;

        if (!mongoose.Types.ObjectId.isValid(memberId)) throw new UserException("Invalid memberId");

        return await this._findOneAndUpdate(
            { code: roomCode, "members._id": new mongoose.Types.ObjectId(memberId) },
            {
                $set: {
                    "members.$.connected": true,
                    "members.$.socketId": socketId,
                },
            },
        );
    }

    async disconnect(socketId: string): Promise<Room> {
        if (!socketId) throw new UserException("Invalid socket ID");

        return await this._findOneAndUpdate(
            { "members.socketId": socketId },
            { $set: { "members.$.connected": false } },
        );
    }

    async reconnect(newSocketId: string, oldSocketId: string): Promise<Room> {
        if (!oldSocketId) throw new UserException("Invalid old socket ID");
        if (!newSocketId) throw new UserException("Invalid new socket ID");

        return await this._findOneAndUpdate(
            {
                "members.socketId": oldSocketId,
            },
            {
                $set: {
                    "members.$.connected": true,
                    "members.$.socketId": newSocketId,
                },
            },
        );
    }

    async leave(socketId: string, input: LeaveRoomInput): Promise<Room> {
        const room = await this.getByCode(input.roomCode);
        if (!room) throw new UserException("Room not found");

        const leavingMember = room.members.find((member) => member.socketId === socketId);
        if (!leavingMember) throw new UserException("Member not found");

        if (leavingMember.isHost) {
            // TODO if `member.isHost` is true, assign `isHost` to
            // someone else at random and `$pull` the member for
            // the matching `socketId`
            const nextHost = room.members.find((m) => m.socketId !== socketId);

            if (!nextHost) {
                await this.delete(input.roomCode);
                return null;
            }

            await this._findOneAndUpdate(
                { code: input.roomCode, "members.socketId": nextHost.socketId },
                {
                    $set: {
                        "members.$.isHost": true,
                    },
                },
            );
        }

        return await this._findOneAndUpdate(
            { code: input.roomCode },
            {
                $pull: {
                    members: {
                        socketId: socketId,
                    },
                },
            },
        );
    }

    async kick(socketId: string, input: KickUserInput): Promise<{ member: Member; room: Room }> {
        const { memberId, roomCode, secret } = input;

        if (!mongoose.Types.ObjectId.isValid(memberId)) throw new UserException("Invalid memberId");

        const room = await this.getByCode(roomCode);

        if (!room) {
            // TODO handle failure
        }

        const member = room.members.find((member) => member._id.toHexString() === memberId);

        if (!member) {
            throw new UserException("Member does not exist in room");
        }

        if (socketId.toLowerCase() === member.socketId.toLowerCase()) {
            throw new UserException("Cannot kick self from room");
        }

        const updated = await this._findOneAndUpdate(
            {
                code: roomCode,
                secret,
                members: {
                    $elemMatch: {
                        socketId: socketId,
                        isHost: true,
                    },
                },
            },
            {
                $pull: {
                    members: {
                        socketId: member.socketId,
                    },
                },
            },
        );

        return {
            member,
            room: updated,
        };
    }

    async updateHost(socketId: string, input: UpdateHostInput): Promise<Room> {
        const { memberId, roomCode, secret } = input;

        if (!mongoose.Types.ObjectId.isValid(memberId)) throw new UserException("Invalid memberId");

        const room = await this.getByCode(roomCode);

        if (!room) {
            // TODO handle failure
        }

        const member = room.members.find((member) => member._id.toHexString() === memberId);

        if (!member) {
            throw new UserException("Member does not exist in room");
        }

        if (socketId.toLowerCase() === member.socketId.toLowerCase()) {
            throw new UserException("Member is already host of room");
        }

        return await this._findOneAndUpdate(
            {
                code: roomCode,
                members: {
                    $elemMatch: {
                        socketId: socketId,
                        isHost: true,
                    },
                },
                secret,
                "members.socketId": { $in: [socketId, member.socketId] },
            },
            {
                secret: nanoid(),
                $set: {
                    "members.$[element1].isHost": false,
                    "members.$[element2].isHost": true,
                },
            },
            {
                arrayFilters: [
                    { "element1.socketId": socketId },
                    { "element2.socketId": member.socketId },
                ],
            },
        );
    }

    async lock(socketId: string, input: LockRoomInput) {
        const { roomCode, secret } = input;

        return await this._findOneAndUpdate(
            {
                code: roomCode,
                members: {
                    $elemMatch: {
                        socketId: socketId,
                        isHost: true,
                    },
                },
                secret,
            },
            [{ $set: { isLocked: { $not: "$isLocked" } } }],
        );
    }

    private _findOne(conditions: unknown) {
        return this.roomModel.findOne(conditions).exec();
    }

    private _findOneAndUpdate(conditions, update, options = {}) {
        return this.roomModel.findOneAndUpdate(conditions, update, { new: true, ...options });
    }
}
