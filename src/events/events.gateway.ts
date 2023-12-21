import type { OnGatewayDisconnect } from "@nestjs/websockets";
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { PinoLogger } from "nestjs-pino";
import { Server, Socket } from "socket.io";
import { UserStatus } from "src/model/enum/user-status.enum";
import type {
    RoomExitedEvent,
    RoomMembersUpdatedEvent,
    RoomUpdatedEvent,
} from "src/model/events/room.event";
import {
    EventOperation,
    type RoomEvents,
    RoomExitedReason,
    type RoomJoinedEvent,
} from "src/model/events/room.event";
import { KickUserInput } from "src/rooms/dto/kick-user.input";
import { UsersService } from "src/users/users.service";

import { CreateRoomInput } from "../rooms/dto/create-room.input";
import { JoinRoomInput } from "../rooms/dto/join-room.input";
import { LeaveRoomInput } from "../rooms/dto/leave-room.input";
import { PassRoomOwnershipInput } from "../rooms/dto/pass-room-ownership.input";
import { UpdateRoomInput } from "../rooms/dto/update-room.input";
import { RoomsService } from "../rooms/rooms.service";
import { EventsMessages } from "./events.messages";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
    namespace: "rooms",
})
export class EventsGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly logger: PinoLogger,
        private readonly roomsService: RoomsService,
        private readonly usersService: UsersService,
    ) {
        this.logger.setContext(this.constructor.name);
    }

    private broadcast(socket: Socket, roomId: string, payload: RoomEvents) {
        return socket.broadcast.to(roomId).emit("event", payload);
    }

    @SubscribeMessage(EventsMessages.CreateRoom)
    async handleCreateRoomMessage(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: CreateRoomInput,
    ): Promise<RoomJoinedEvent> {
        const user = this.usersService.getOrCreateUser(input.user, socket.id);
        const room = this.roomsService.createRoom(input.room, user.id);
        const userIds = this.roomsService.getUserIdsForRoom(room.id);
        const members = this.usersService.getUsersById(userIds);

        await socket.join(room.id);

        const event: RoomJoinedEvent = {
            operation: EventOperation.RoomJoined,
            data: {
                me: user,
                roomId: room.id,
                room,
                members,
            },
        };

        return event;
    }

    @SubscribeMessage(EventsMessages.JoinRoom)
    async handleJoinRoomMessage(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: JoinRoomInput,
    ) {
        const user = this.usersService.getOrCreateUser(input.user, socket.id);

        const room = this.roomsService.joinRoom(input.roomId, user.id);
        const userIds = this.roomsService.getUserIdsForRoom(room.id);
        const members = this.usersService.getUsersById(userIds);

        const roomMembersUpdatedEvent: RoomMembersUpdatedEvent = {
            operation: EventOperation.RoomMembersUpdated,
            data: {
                roomId: room.id,
                members,
            },
        };

        await socket.join(room.id);
        await this.broadcast(socket, room.id, roomMembersUpdatedEvent);

        const event: RoomJoinedEvent = {
            operation: EventOperation.RoomJoined,
            data: {
                me: user,
                roomId: room.id,
                room,
                members,
            },
        };

        return event;
    }

    @SubscribeMessage(EventsMessages.KickUserFromRoom)
    async handleKickUser(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: KickUserInput,
    ) {
        const { roomId, userId, userIdToKick } = input;
        const room = this.roomsService.kickUserFromRoom(roomId, userId, userIdToKick);
        const userIds = this.roomsService.getUserIdsForRoom(roomId);
        const usersInRoom = this.usersService.getUsersById(userIds);

        const kickedUser = this.usersService.getUserById(userIdToKick);

        if (!room) {
            const event: RoomExitedEvent = {
                operation: EventOperation.RoomExited,
                data: {
                    reason: RoomExitedReason.RoomClosed,
                    roomId,
                },
            };

            await this.broadcast(socket, roomId, event);
            await socket.in(roomId).socketsLeave(roomId);

            return event;
        }

        const roomKickedEvent: RoomExitedEvent = {
            operation: EventOperation.RoomExited,
            data: {
                reason: RoomExitedReason.Kicked,
                roomId,
            },
        };

        const roomUpdatedEvent: RoomUpdatedEvent = {
            operation: EventOperation.RoomUpdated,
            data: {
                roomId,
                room,
                members: usersInRoom,
            },
        };

        await this.server.to(kickedUser.socketId).emit("event", roomKickedEvent);
        await this.server.in(kickedUser.socketId).socketsLeave(roomId);

        await this.broadcast(socket, room.id, roomUpdatedEvent);

        return roomUpdatedEvent;
    }

    @SubscribeMessage(EventsMessages.LeaveRoom)
    async handleLeaveRoomMessage(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: LeaveRoomInput,
    ) {
        const { roomId, userId } = input;
        const room = this.roomsService.leaveRoom(roomId, userId);

        const roomClosedEvent: RoomExitedEvent = {
            operation: EventOperation.RoomExited,
            data: {
                reason: RoomExitedReason.RoomClosed,
                roomId,
            },
        };
        const roomLeftEvent: RoomExitedEvent = {
            operation: EventOperation.RoomExited,
            data: {
                reason: RoomExitedReason.Left,
                roomId,
            },
        };

        if (!room) {
            await this.broadcast(socket, roomId, roomClosedEvent);
            await socket.in(roomId).socketsLeave(roomId);
            return roomLeftEvent;
        }

        const userIds = this.roomsService.getUserIdsForRoom(roomId);
        const usersInRoom = this.usersService.getUsersById(userIds);

        const roomUpdatedEvent: RoomUpdatedEvent = {
            operation: EventOperation.RoomUpdated,
            data: {
                roomId,
                room,
                members: usersInRoom,
            },
        };

        await this.broadcast(socket, roomId, roomUpdatedEvent);
        await socket.leave(room.id);
        return roomLeftEvent;
    }

    @SubscribeMessage(EventsMessages.PassRoomOwnership)
    async handlePassedOwnershipMessage(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: PassRoomOwnershipInput,
    ) {
        const room = this.roomsService.passRoomOwnership(input);

        const roomUpdatedEvent: RoomUpdatedEvent = {
            operation: EventOperation.RoomUpdated,
            data: {
                roomId: room.id,
                room,
            },
        };

        await this.broadcast(socket, room.id, roomUpdatedEvent);

        return roomUpdatedEvent;
    }

    @SubscribeMessage(EventsMessages.UpdateRoom)
    async handleLockRoomMessage(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: UpdateRoomInput,
    ) {
        const room = this.roomsService.updateRoom(input);

        const roomUpdatedEvent: RoomUpdatedEvent = {
            operation: EventOperation.RoomUpdated,
            data: {
                roomId: room.id,
                room,
            },
        };

        await this.broadcast(socket, room.id, roomUpdatedEvent);

        return roomUpdatedEvent;
    }

    async handleDisconnect(socket: Socket) {
        const { id: socketId } = socket;
        this.logger.info({ socketId }, "Socket disconnected");
        const user = this.usersService.updateUserStatusForSocketId(socketId, UserStatus.Inactive);

        if (!user) {
            this.logger.info({ socketId }, "No user found for this socket ID");
            return;
        }

        const rooms = this.roomsService.findRoomsForUser(user.id);

        if (!rooms?.length) {
            this.logger.info({ socketId }, "User was not in any rooms");
            return;
        }

        const broadcasts = rooms.map((room) => {
            const userIds = this.roomsService.getUserIdsForRoom(room.id);
            const usersInRoom = this.usersService.getUsersById(userIds);
            const event: RoomMembersUpdatedEvent = {
                operation: EventOperation.RoomMembersUpdated,
                data: {
                    members: usersInRoom,
                    roomId: room.id,
                },
            };
            return this.broadcast(socket, room.id, event);
        });

        await Promise.all(broadcasts);
    }
}
