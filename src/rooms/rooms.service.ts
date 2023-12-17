import { Injectable } from "@nestjs/common";
import { CreateRoomInput } from "./dto/create-room.input";
import { ConfigService } from "../config/config.service";
import { JoinRoomInput } from "./dto/join-room.input";
import { generateRoomId } from "./util/generate-room-id";
import { mapCreateRoomInputToStoreModel } from "./util/map-create-room-input-to-store-model";
import { PinoLogger } from "nestjs-pino";
import { Room } from "../model/room.model";
import { FindRoomsInput } from "./dto/find-rooms.input";
import { LeaveRoomInput } from "./dto/leave-room.input";
import { SuccessModel } from "src/model/success.model";
import { Socket } from "socket.io";

@Injectable()
export class RoomsService {
    private rooms: Map<string, Room> = new Map();

    constructor(
        private configService: ConfigService,
        private readonly logger: PinoLogger,
    ) {
        this.logger.setContext(this.constructor.name);
    }

    userHasAccessToRoom(room: Room, userId: string) {
        const isUserRoomHost = room.host.id === userId;
        const isUserMemberOfRoom = room.users.find((user) => user.id === userId);

        return isUserRoomHost || Boolean(isUserMemberOfRoom);
    }

    createRoom(input: CreateRoomInput, client: Socket): Room | null {
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

        client.join(room.id);

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

        if (room.maxUsers && room.maxUsers === room.users.length) {
            const message = "The room is full";
            this.logger.info({ roomId }, message);
            return { message, success: false };
        }

        return { success: true };
    }

    findRoomsForUser({ userId }: FindRoomsInput): Room[] {
        const matches = [];
        for (const room of this.rooms.values()) {
            if (this.userHasAccessToRoom(room, userId)) {
                matches.push(room);
            }
        }

        return matches;
    }

    joinRoom({ roomId, user }: JoinRoomInput, client: Socket): Room | null {
        const { id: userId } = user;

        this.logger.info({ roomId, userId }, "Joining room for user");

        const existingRoom = this.rooms.get(roomId);

        if (!existingRoom) {
            this.logger.info({ roomId, userId }, "Room wit ID does not exist");
            return null;
        }

        if (this.userHasAccessToRoom(existingRoom, userId)) {
            this.logger.info({ roomId, userId }, "User is already a member of this room");

            client.join(roomId);

            return existingRoom;
        }

        const updatedRoom: Room = {
            ...existingRoom,
            users: [...existingRoom.users, user],
        };

        this.rooms.set(roomId, updatedRoom);

        client.join(roomId);

        return updatedRoom;
    }

    leaveRoom({ roomId, user }: LeaveRoomInput): SuccessModel {
        const existingRoom = this.rooms.get(roomId);
        const { id: userId } = user;

        if (!existingRoom) {
            const message = "Room does not exist";
            this.logger.info({ roomId, userId }, message);
            return { message, success: false };
        }

        if (existingRoom.host.id === userId) {
            // TODO close room
            this.rooms.delete(roomId);
            return { success: true };
        }

        const updatedRoom = {
            ...existingRoom,
            users: existingRoom.users.filter((user) => user.id !== userId),
            updatedAt: new Date(),
        };

        this.rooms.set(roomId, updatedRoom);

        return { success: true };
    }
}
