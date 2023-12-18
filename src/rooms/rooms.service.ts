import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { CreateRoomInput } from "./dto/create-room.input";
import { ConfigService } from "../config/config.service";
import { JoinRoomInput } from "./dto/join-room.input";
import { generateRoomId } from "./util/generate-room-id";
import { mapCreateRoomInputToStoreModel } from "./util/map-create-room-input-to-store-model";
import { PinoLogger } from "nestjs-pino";
import { Room } from "../model/room.model";
import { LeaveRoomInput } from "./dto/leave-room.input";
import { SuccessModel } from "src/model/success.model";
import { mapUserToStoreModel } from "./util/map-user-to-store-model";
import { ToggleLockRoomInput } from "./dto/toggle-lock-room.input";
import { PassRoomOwnershipInput } from "./dto/pass-room-ownership.input";

@Injectable()
export class RoomsService {
    private rooms: Map<string, Room> = new Map();

    constructor(
        private configService: ConfigService,
        private readonly logger: PinoLogger,
    ) {
        this.logger.setContext(this.constructor.name);
    }

    isRoomFull(room: Room) {
        return room.maxUsers && room.maxUsers <= room.users.length;
    }

    isRoomLocked(room: Room) {
        return room.isLocked;
    }

    findUserInRoom(room: Room, socketId: string) {
        return room.users.find((user) => user.socketId === socketId);
    }

    createRoom(input: CreateRoomInput): Room | null {
        this.logger.info({ userId: input.user.id }, "Creating room");

        const createRoomWithUniqueRoomId = (): Room | null => {
            const roomId = generateRoomId(
                this.configService.roomIdAlphabet,
                this.configService.roomIdLength,
            );

            const existingRoom = this.rooms.get(roomId);

            if (existingRoom) {
                return createRoomWithUniqueRoomId();
            }

            const room = mapCreateRoomInputToStoreModel(input, roomId);

            this.rooms.set(room.id, room);

            return room;
        };

        const room = createRoomWithUniqueRoomId();

        return room;
    }

    findRoom(roomId: string): SuccessModel {
        this.logger.info({ roomId }, "Finding room");

        const room = this.rooms.get(roomId);

        if (!room) {
            const message = "No room found matching this ID";
            this.logger.info({ roomId }, message);
            return { message, success: false };
        }

        if (this.isRoomFull(room)) {
            const message = "The room is full";
            this.logger.info({ roomId }, message);
            return { message, success: false };
        }

        return { success: true };
    }

    joinRoom({ roomId, user }: JoinRoomInput): Room | null {
        const { id: userId, socketId } = user;

        this.logger.info({ roomId, userId }, "Joining room for user");

        const room = this.rooms.get(roomId);

        if (!room) {
            const message = "Room with ID does not exist";
            this.logger.info({ roomId, userId }, message);
            throw new NotFoundException(message);
        }

        if (this.findUserInRoom(room, socketId)) {
            this.logger.info({ roomId, userId }, "User is already a member of this room");
            return room;
        }

        if (this.isRoomFull(room)) {
            const message = "Room is full";
            this.logger.info({ roomId, userId }, message);
            throw new UnauthorizedException(message);
        }

        if (this.isRoomLocked(room)) {
            const message = "Room is locked";
            this.logger.info({ roomId, userId }, message);
            throw new UnauthorizedException(message);
        }

        const updatedRoom: Room = {
            ...room,
            users: [...room.users, mapUserToStoreModel(user, false)],
        };

        this.rooms.set(roomId, updatedRoom);

        return updatedRoom;
    }

    leaveRoom({ roomId, user }: LeaveRoomInput) {
        const { id: userId, socketId } = user;

        const room = this.rooms.get(roomId);

        if (!room) {
            const message = "Room does not exist";
            this.logger.info({ roomId, userId }, message);
            return { isHost: undefined, room, success: false };
        }

        const userPerformingAction = this.findUserInRoom(room, socketId);

        if (userPerformingAction.isHost) {
            this.logger.info({ roomId, userId }, "User is host of room, deleting room");
            this.rooms.delete(roomId);
            return { isHost: true, room, success: true };
        }

        this.logger.info({ roomId, userId }, "Removing user from room");

        const updatedRoom: Room = {
            ...room,
            users: room.users.filter((user) => user.socketId !== socketId),
            updatedAt: new Date(),
        };

        this.rooms.set(roomId, updatedRoom);

        return { isHost: false, room: updatedRoom, success: true };
    }

    leaveRoomWithSocketId(socketId: string) {
        for (const room of this.rooms.values()) {
            const user = this.findUserInRoom(room, socketId);

            if (user) {
                return this.leaveRoom({ roomId: room.id, user });
            }
        }

        return { isHost: null, room: null, success: false };
    }

    toggleRoomLockedState({ roomId, user }: ToggleLockRoomInput) {
        const { id: userId, socketId } = user;
        const room = this.rooms.get(roomId);

        if (!room) {
            const message = "Room with ID does not exist";
            this.logger.info({ roomId, userId }, message);
            throw new NotFoundException(message);
        }

        const userPerformingAction = this.findUserInRoom(room, socketId);

        if (!userPerformingAction.isHost) {
            const message = "User is not host and cannot toggle room locked state";
            this.logger.info({ roomId, userId }, message);
            throw new UnauthorizedException(message);
        }

        const updatedRoom: Room = {
            ...room,
            isLocked: !room.isLocked,
        };

        this.rooms.set(roomId, updatedRoom);

        return updatedRoom;
    }

    passRoomOwnership({ roomId, user, newHost }: PassRoomOwnershipInput) {
        const { id: userId, socketId } = user;
        const room = this.rooms.get(roomId);

        const userPerformingAction = this.findUserInRoom(room, socketId);
        const userReceivingOwnership = this.findUserInRoom(room, newHost.socketId);

        if (!userPerformingAction?.isHost) {
            const message = "User does not have permission to pass room ownership";
            this.logger.info({ roomId, userId }, message);
            throw new UnauthorizedException(message);
        }

        if (!userReceivingOwnership) {
            const message = "New host is not a member of the room";
            this.logger.info({ roomId, userId, newHostId: newHost.id }, message);
            throw new NotFoundException(message);
        }

        const updatedRoom: Room = {
            ...room,
            users: room.users.map((user) => ({
                ...user,
                isHost: newHost.socketId === user.socketId,
            })),
        };

        this.rooms.set(room.id, updatedRoom);

        return updatedRoom;
    }
}
