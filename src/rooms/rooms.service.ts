import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

import type { RoomStoreModel } from "../model/room-store.model";
import type { SuccessModel } from "../model/success.model";
import type { PassRoomOwnershipInput } from "./dto/pass-room-ownership.input";
import type { RoomConfigurationInput } from "./dto/room-configuration.input";
import type { RoomDtoModel } from "./dto/room-dto.model";
import { RoomsStore } from "./rooms.store";
import { UserRoomsStore } from "./user-rooms.store";
import { mapRoomStoreModelToDto } from "./util/map-room-store-model-to-dto";
@Injectable()
export class RoomsService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly roomsStore: RoomsStore,
        private readonly userRoomsStore: UserRoomsStore,
    ) {
        this.logger.setContext(this.constructor.name);
    }

    private isUserHostOfRoom(room: RoomStoreModel, userId: string) {
        return room.hostId === userId;
    }

    private isUserAloneInRoom(room: RoomStoreModel, userId: string) {
        return room.users.size === 1 && this.isUserInRoom(room, userId);
    }

    private isUserInRoom(room: RoomStoreModel, userId: string) {
        return room.users.has(userId);
    }

    private isRoomFull(room: RoomStoreModel) {
        return room.maxUsers && room.users.size >= room.maxUsers;
    }

    private isRoomLocked(room: RoomStoreModel) {
        return room.isLocked;
    }

    createRoom(config: RoomConfigurationInput, userId: string): RoomDtoModel {
        this.logger.info({ userId: userId }, "Creating room");

        const room = this.roomsStore.createRoom({
            hostId: userId,
            isLocked: config.isLocked,
            maxUsers: config.maxUsers,
        });

        this.userRoomsStore.addRoomToUser(userId, room.id);

        return mapRoomStoreModelToDto(room);
    }

    findRoomById(roomId: string): SuccessModel {
        this.logger.info({ roomId }, "Finding room");

        const room = this.roomsStore.getRoomById(roomId);

        if (!room) {
            const message = "No room found matching this ID";
            this.logger.info({ roomId }, message);
            return { message, success: false };
        }

        if (this.isRoomFull(room)) {
            const message = "This room is full";
            this.logger.info({ roomId }, message);
            return { message, success: false };
        }

        return { success: true };
    }

    getUserIdsForRoom(roomId: string): string[] {
        const room = this.roomsStore.getRoomById(roomId);

        if (!room) {
            return [];
        }

        return Array.from(room.users);
    }

    findRoomsForUser(userId: string): RoomDtoModel[] {
        const rooms = this.userRoomsStore.getRoomsForUser(userId);

        if (!rooms) return [];

        return Array.from(rooms)
            .map((roomId) => {
                const room = this.roomsStore.getRoomById(roomId);
                return mapRoomStoreModelToDto(room);
            })
            .filter(Boolean);
    }

    joinRoom(roomId: string, userId: string): RoomDtoModel {
        this.logger.info({ roomId, userId }, "Joining room for user");

        const room = this.roomsStore.getRoomById(roomId);

        if (!room) {
            const message = "Room with this ID does not exist";
            this.logger.info({ roomId, userId }, message);
            throw new NotFoundException(message);
        }

        if (this.isUserInRoom(room, userId)) {
            this.logger.info({ roomId, userId }, "User is already a member of this room");
            return mapRoomStoreModelToDto(room);
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

        const joinedRoom = this.roomsStore.addUserToRoom(roomId, userId);

        this.userRoomsStore.addRoomToUser(userId, joinedRoom.id);

        return mapRoomStoreModelToDto(joinedRoom);
    }

    leaveRoom(roomId: string, userId: string): RoomDtoModel | boolean {
        const room = this.roomsStore.getRoomById(roomId);

        if (!room) {
            const message = "Room does not exist";
            this.logger.info({ roomId, userId }, message);
            throw new NotFoundException(message);
        }

        if (!this.isUserInRoom(room, userId)) {
            const message = "User does not belong to room";
            this.logger.info({ roomId, userId }, message);
            throw new BadRequestException(message);
        }

        if (this.isUserAloneInRoom(room, userId)) {
            this.logger.info({ roomId, userId }, "No users left in room, deleting");
            this.roomsStore.deleteRoom(roomId);
            return true;
        }

        if (this.isUserHostOfRoom(room, userId)) {
            this.logger.info({ roomId, userId }, "User is host of room, passing ownership");
            const nextUser = Array.from(room.users).filter((user) => user !== userId)[0];
            const updatedRoom = this.roomsStore.removeUserAndUpdateHost(roomId, userId, nextUser);
            return mapRoomStoreModelToDto(updatedRoom);
        }

        this.logger.info({ roomId, userId }, "Removing user from room");
        const updatedRoom = this.roomsStore.removeUserFromRoom(roomId, userId);

        this.userRoomsStore.removeRoomFromUser(userId, updatedRoom.id);

        return mapRoomStoreModelToDto(updatedRoom);
    }

    toggleRoomLockedState(roomId: string, userId: string): RoomDtoModel {
        const room = this.roomsStore.getRoomById(roomId);

        if (!room) {
            const message = "Room with ID does not exist";
            this.logger.info({ roomId, userId }, message);
            throw new NotFoundException(message);
        }

        if (room.hostId !== userId) {
            const message = "User is not host and cannot toggle room locked state";
            this.logger.info({ roomId, userId }, message);
            throw new UnauthorizedException(message);
        }

        const updatedRoom = this.roomsStore.updateRoom(roomId, {
            isLocked: !room.isLocked,
        });

        return mapRoomStoreModelToDto(updatedRoom);
    }

    passRoomOwnership(input: PassRoomOwnershipInput): RoomDtoModel {
        const { userId, newHostId, roomId } = input;
        const room = this.roomsStore.getRoomById(roomId);

        if (room.hostId !== userId) {
            const message = "User does not have permission to pass room ownership";
            this.logger.info({ roomId, userId }, message);
            throw new UnauthorizedException(message);
        }

        if (!this.isUserInRoom(room, newHostId)) {
            const message = "New host is not a member of the room";
            this.logger.info({ roomId, userId, newHostId }, message);
            throw new NotFoundException(message);
        }

        const updatedRoom = this.roomsStore.updateRoomHost(roomId, newHostId);

        return mapRoomStoreModelToDto(updatedRoom);
    }

    kickUserFromRoom(roomId: string, userId: string, userIdToKick: string): RoomDtoModel | boolean {
        const room = this.roomsStore.getRoomById(roomId);

        if (room.hostId !== userId) {
            const message = "User does not have permission to kick other users";
            this.logger.info({ roomId, userId }, message);
            throw new UnauthorizedException(message);
        }

        return this.leaveRoom(roomId, userIdToKick);
    }
}
