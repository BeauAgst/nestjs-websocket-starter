import { Injectable } from "@nestjs/common";
import { FindRoomInput } from "./dto/find-room.input";
import { CreateRoomInput } from "./dto/create-room.input";
import { ConfigService } from "../config/config.service";
import { JoinRoomInput } from "./dto/join-room.input";
import { generateRoomPassphrase } from "./util/generate-room-passphrase";
import { mapCreateRoomInputToStoreModel } from "./util/map-create-room-input-to-store-model";
import { PinoLogger } from "nestjs-pino";
import { Room } from "../model/room.model";
import { FindRoomsInput } from "./dto/find-rooms.input";
import { LeaveRoomInput } from "./dto/leave-room.input";
import { SuccessModel } from "src/model/success.model";

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

    findRoomForPassphrase(passphrase: string): Room | null {
        for (const room of this.rooms.values()) {
            if (room.passphrase === passphrase) {
                return room;
            }
        }

        return null;
    }

    createRoom(input: CreateRoomInput): Room | null {
        this.logger.info({ userId: input.user.id }, "Creating room");

        const createRoomWithUniquePassphrase = (): Room | null => {
            const passphrase = generateRoomPassphrase(
                this.configService.roomPassphraseAlphabet,
                this.configService.roomPassphraseLength,
            );

            const roomWithPassphraseExists = this.findRoomForPassphrase(passphrase);

            if (roomWithPassphraseExists) {
                return createRoomWithUniquePassphrase();
            }

            const room = mapCreateRoomInputToStoreModel(input, passphrase);

            this.rooms.set(room.id, room);

            return room;
        };

        return createRoomWithUniquePassphrase();
    }

    findRoom({ roomId, userId }: FindRoomInput): Room | null {
        this.logger.info({ roomId, userId }, "Finding room for user");

        const room = this.rooms.get(roomId);

        if (!room) {
            this.logger.info({ roomId, userId }, "No room found matching this ID");
            return null;
        }

        const userHasAccessToRoom = this.userHasAccessToRoom(room, userId);

        if (!userHasAccessToRoom) {
            this.logger.info({ roomId, userId }, "User does not have access to room");

            return null;
        }

        return room ?? null;
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

    joinRoom({ passphrase, user }: JoinRoomInput): Room | null {
        const { id: userId } = user;

        this.logger.info({ userId }, "Joining room for user");

        const existingRoom = this.findRoomForPassphrase(passphrase);

        if (!existingRoom) {
            this.logger.info({ passphrase, userId }, "Room with passphrase does not exist");
            return null;
        }

        if (this.userHasAccessToRoom(existingRoom, userId)) {
            this.logger.info(
                { roomId: existingRoom.id, userId },
                "User is already a member of this room",
            );

            return existingRoom;
        }

        const updatedRoom: Room = {
            ...existingRoom,
            users: [...existingRoom.users, user],
        };

        this.rooms.set(existingRoom.id, updatedRoom);

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
