import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as mongoose from "mongoose";
import { nanoid } from "nanoid";
import { UserException } from "src/common/user.exception";

import type { ConnectToRoomInput } from "./dto/connect-to-room.input";
import type { GiveHostInput } from "./dto/give-host.input";
import type { KickUserInput } from "./dto/kick-user.input";
import type { LeaveRoomInput } from "./dto/leave-room.input";
import type { LockRoomInput } from "./dto/look-room.input";
import type { Room } from "./schema/room.schema";

@Injectable()
export class MembersService {
    constructor(@InjectModel("Room") private readonly roomModel: Model<Room>) {}

    async connect(socketId: string, input: ConnectToRoomInput): Promise<Room> {
        const { memberId, roomCode } = input;
        if (!socketId) throw new UserException("Missing socket ID");
        if (!mongoose.Types.ObjectId.isValid(memberId)) throw new UserException("Invalid memberId");

        return await this._findOneRoomAndUpdate(
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

        return await this._findOneRoomAndUpdate(
            { "members.socketId": socketId },
            { $set: { "members.$.connected": false } },
        );
    }

    async reconnect(newSocketId: string, oldSocketId: string): Promise<Room> {
        if (!oldSocketId) throw new UserException("Invalid old socket ID");
        if (!newSocketId) throw new UserException("Invalid new socket ID");

        return await this._findOneRoomAndUpdate(
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
        if (!socketId) throw new UserException("Invalid socket ID");

        return await this._findOneRoomAndUpdate(
            { code: input.roomCode, "members.socketId": socketId },
            {
                $pull: {
                    members: {
                        socketId: socketId,
                    },
                },
            },
        );
    }

    async kick(socketId: string, input: KickUserInput): Promise<Room> {
        if (!socketId) throw new UserException("Invalid socket ID");

        const { roomCode, secret, socketIdToKick } = input;

        return await this._findOneRoomAndUpdate(
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
                        socketId: socketIdToKick,
                    },
                },
            },
        );
    }

    async giveHost(socketId: string, input: GiveHostInput): Promise<Room> {
        if (!socketId) throw new UserException("Invalid socket ID");

        const { roomCode, secret, socketIdToHost } = input;

        return await this._findOneRoomAndUpdate(
            {
                code: roomCode,
                members: {
                    $elemMatch: {
                        socketId: socketId,
                        isHost: true,
                    },
                },
                secret,
                "members.socketId": { $in: [socketId, socketIdToHost] },
            },
            {
                secret: nanoid(),
                $set: {
                    "members.$[element1].isHost": false,
                    "members.$[element2].isHost": true,
                },
            },
        );
    }

    async lockRoom(socketId: string, input: LockRoomInput) {
        if (!socketId) throw new UserException("Invalid socket ID");

        const { roomCode, secret } = input;

        return await this._findOneRoomAndUpdate(
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

    _findOneRoomAndUpdate(conditions, update) {
        return this.roomModel.findOneAndUpdate(conditions, update, { new: true }).exec();
    }
}
