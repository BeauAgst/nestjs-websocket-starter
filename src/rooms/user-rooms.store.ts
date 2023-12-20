import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class UserRoomsStore {
    private userRooms: Map<string, Set<string>> = new Map();

    constructor(private readonly logger: PinoLogger) {
        this.logger.setContext(this.constructor.name);
    }

    addRoomToUser(userId: string, roomId: string) {
        const rooms = this.userRooms.get(userId) ?? new Set();

        rooms.add(roomId);

        this.userRooms.set(userId, rooms);

        return rooms;
    }

    getRoomsForUser(userId: string) {
        return this.userRooms.get(userId);
    }

    removeRoomFromUser(userId: string, roomId: string) {
        const rooms = this.userRooms.get(userId);

        if (!rooms) return null;

        rooms.delete(roomId);

        this.userRooms.set(userId, rooms);

        return rooms;
    }
}
