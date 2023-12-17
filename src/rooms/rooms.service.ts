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
        const totalUsersIncludingHost = room.users.length + 1;
        return room.maxUsers && room.maxUsers === totalUsersIncludingHost;
    }

    isRoomLocked(room: Room) {
        return room.isLocked;
    }

    isUserMemberOfRoom(room: Room, userId: string) {
        const isUserRoomHost = this.isUserRoomHost(room, userId);
        const isUserMemberOfRoom = room.users.find((user) => user.id === userId);

        return isUserRoomHost || Boolean(isUserMemberOfRoom);
    }

    isUserRoomHost(room: Room, userId: string) {
        return room.host.id === userId;
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
        const { id: userId } = user;

        this.logger.info({ roomId, userId }, "Joining room for user");

        const room = this.rooms.get(roomId);

        if (!room) {
            const message = "Room with ID does not exist";
            this.logger.info({ roomId, userId }, message);
            throw new NotFoundException(message);
        }

        if (this.isUserMemberOfRoom(room, userId)) {
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
            users: [...room.users, mapUserToStoreModel(user)],
        };

        this.rooms.set(roomId, updatedRoom);

        return updatedRoom;
    }

    leaveRoom({ roomId, user }: LeaveRoomInput) {
        const { id: userId } = user;

        const existingRoom = this.rooms.get(roomId);

        if (!existingRoom) {
            const message = "Room does not exist";
            this.logger.info({ roomId, userId }, message);
            return { isHost: undefined, room: existingRoom, success: false };
        }

        if (existingRoom.host.id === userId) {
            this.logger.info({ roomId, userId }, "User is host of room, deleting room");
            this.rooms.delete(roomId);
            return { isHost: true, room: existingRoom, success: true };
        }

        this.logger.info({ roomId, userId }, "Removing user from room");

        const updatedRoom = {
            ...existingRoom,
            users: existingRoom.users.filter((user) => user.id !== userId),
            updatedAt: new Date(),
        };

        this.rooms.set(roomId, updatedRoom);

        return { isHost: false, room: updatedRoom, success: true };
    }

    leaveRoomWithSocketId(socketId: string) {
        for (const room of this.rooms.values()) {
            const isHost = room.host.socketId === socketId;

            if (isHost) {
                const result = this.leaveRoom({ roomId: room.id, user: room.host });
                return { isHost: true, room: result.room, success: result.success };
            }

            const matchingUser = room.users.find((user) => user.socketId === socketId);

            if (matchingUser) {
                const result = this.leaveRoom({ roomId: room.id, user: matchingUser });
                return { isHost: false, room: result.room, success: result.success };
            }
        }

        return { isHost: null, room: null, success: false };
    }

    toggleRoomLockedState({ roomId, user }: ToggleLockRoomInput) {
        const userId = user.id;
        const room = this.rooms.get(roomId);

        if (!room) {
            const message = "Room with ID does not exist";
            this.logger.info({ roomId, userId }, message);
            throw new NotFoundException(message);
        }

        const isRoomHost = this.isUserRoomHost(room, userId);

        if (!isRoomHost) {
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
}
