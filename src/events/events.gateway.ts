import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
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
import { UsersService } from "src/users/users.service";

import { BadRequestTransformationFilter } from "../filters/bad-request-exception-transformation.filter";
import { CreateRoomInput } from "../rooms/dto/create-room.input";
import { JoinRoomInput } from "../rooms/dto/join-room.input";
import { LeaveRoomInput } from "../rooms/dto/leave-room.input";
import { PassRoomOwnershipInput } from "../rooms/dto/pass-room-ownership.input";
import { ToggleLockRoomInput } from "../rooms/dto/toggle-lock-room.input";
import { RoomsService } from "../rooms/rooms.service";

@UseFilters(BadRequestTransformationFilter)
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

    private broadcastUpdate(socket: Socket, roomId: string, payload: unknown) {
        return socket.broadcast.to(roomId).emit("event", JSON.stringify(payload));
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("CREATE_ROOM")
    async handleCreateRoomMessage(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: CreateRoomInput,
    ) {
        const user = this.usersService.getOrCreateUser(input.user);
        const room = this.roomsService.createRoom(input.room, user.id);

        await socket.join(room.id);

        const userIds = this.roomsService.getUserIdsForRoom(room.id);
        const usersInRoom = this.usersService.getUsersById(userIds);

        return { me: user, room, users: usersInRoom };
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("JOIN_ROOM")
    async handleJoinRoomMessage(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: JoinRoomInput,
    ) {
        const user = this.usersService.getOrCreateUser(input.user);

        const room = this.roomsService.joinRoom(input.roomId, user.id);

        const userIds = this.roomsService.getUserIdsForRoom(room.id);
        const usersInRoom = this.usersService.getUsersById(userIds);

        await socket.join(room.id);
        await this.broadcastUpdate(socket, room.id, { room, users: usersInRoom });

        return { me: user, room, users: usersInRoom };
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("LEAVE_ROOM")
    async handleLeaveRoomMessage(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: LeaveRoomInput,
    ) {
        const { roomId, userId } = input;
        const room = this.roomsService.leaveRoom(roomId, userId);

        if (!room) {
            await socket.in(roomId).socketsLeave(roomId);
            return true;
        }

        const userIds = this.roomsService.getUserIdsForRoom(roomId);
        const usersInRoom = this.usersService.getUsersById(userIds);

        const payload = { room, users: usersInRoom };

        await socket.leave(roomId);
        await this.broadcastUpdate(socket, roomId, payload);

        return payload;
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("TOGGLE_ROOM_LOCKED_STATE")
    async handleLockRoomMessage(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: ToggleLockRoomInput,
    ) {
        const room = this.roomsService.toggleRoomLockedState(input.roomId, input.userId);
        const payload = { room };

        await this.broadcastUpdate(socket, room.id, payload);

        return payload;
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("PASS_ROOM_OWNERSHIP")
    async handlePassedOwnershipMessage(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: PassRoomOwnershipInput,
    ) {
        const room = this.roomsService.passRoomOwnership(input);
        const payload = { room };

        await this.broadcastUpdate(socket, room.id, payload);

        return payload;
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
            return this.broadcastUpdate(socket, room.id, { room, users: usersInRoom });
        });

        await Promise.all(broadcasts);
    }
}
