import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

import { ConfigService } from "../config/config.service";
import type { RoomStoreModel } from "../model/room-store.model";
import { generateRoomId } from "./util/generate-room-id";

type CreateRoomInput = {
    hostId: string;
    isLocked?: boolean;
    maxUsers?: number;
};

type UpdateRoomInput = {
    isLocked?: boolean;
    maxUsers?: number;
};

@Injectable()
export class RoomsStore {
    private rooms: Map<string, RoomStoreModel> = new Map();

    constructor(
        private configService: ConfigService,
        private readonly logger: PinoLogger,
    ) {
        this.logger.setContext(this.constructor.name);
    }

    private generateUniqueRoomId() {
        const roomId = generateRoomId();

        const existingRoom = this.rooms.get(roomId);

        if (existingRoom) {
            return this.generateUniqueRoomId();
        }

        return roomId;
    }

    createRoom(input: CreateRoomInput) {
        const createdAt = new Date();
        const id = this.generateUniqueRoomId();

        const { hostId, isLocked, maxUsers } = input;

        const room: RoomStoreModel = {
            createdAt,
            hostId,
            id,
            isLocked: isLocked ?? false,
            maxUsers: maxUsers ?? 0,
            updatedAt: createdAt,
            users: new Set([hostId]),
        };

        this.rooms.set(id, room);

        return room;
    }

    getRoomById(roomId: string) {
        return this.rooms.get(roomId) ?? null;
    }

    updateRoom(roomId: string, updates: UpdateRoomInput) {
        const room = this.getRoomById(roomId);

        if (!room) return null;

        const updatedRoom: RoomStoreModel = {
            ...room,
            isLocked: updates.isLocked ?? room.isLocked,
            maxUsers: updates.maxUsers ?? room.maxUsers,
            updatedAt: new Date(),
        };

        this.rooms.set(roomId, updatedRoom);

        return updatedRoom;
    }

    updateRoomHost(roomId: string, hostId: string) {
        const room = this.getRoomById(roomId);

        if (!room) return null;

        const updatedRoom: RoomStoreModel = {
            ...room,
            hostId,
            updatedAt: new Date(),
        };

        this.rooms.set(roomId, updatedRoom);

        return updatedRoom;
    }

    removeUserAndUpdateHost(roomId: string, userId: string, newHostId: string) {
        const room = this.getRoomById(roomId);

        if (!room) return null;

        room.users.delete(userId);

        const updatedRoom: RoomStoreModel = {
            ...room,
            hostId: newHostId,
            updatedAt: new Date(),
        };

        this.rooms.set(roomId, updatedRoom);

        return updatedRoom;
    }

    addUserToRoom(roomId: string, userId: string) {
        const room = this.getRoomById(roomId);

        if (!room) return null;

        room.users.add(userId);

        this.rooms.set(roomId, {
            ...room,
            updatedAt: new Date(),
        });

        return room;
    }

    removeUserFromRoom(roomId: string, userId: string) {
        const room = this.getRoomById(roomId);

        if (!room) return null;

        room.users.delete(userId);

        this.rooms.set(roomId, {
            ...room,
            updatedAt: new Date(),
        });

        return room;
    }

    deleteRoom(roomId: string): boolean {
        return this.rooms.delete(roomId);
    }
}
