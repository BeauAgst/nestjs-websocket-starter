import { UsePipes, ValidationPipe } from "@nestjs/common";
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
import type { GatewayEvent, RoomExitedEvent, RoomUpdatedEvent } from "src/model/events/room.event";
import { RoomEvent, RoomExitReason } from "src/model/events/room.event";
import { ConnectToRoomInput } from "src/rooms/dto/connect-to-room.input";
import { UpdateHostInput } from "src/rooms/dto/give-host.input";
import { KickUserInput } from "src/rooms/dto/kick-user.input";
import { LeaveRoomInput } from "src/rooms/dto/leave-room.input";
import { LockRoomInput } from "src/rooms/dto/look-room.input";
import { RoomsService } from "src/rooms/rooms.service";
import type { Room } from "src/rooms/schema/room.schema";
import { mapRoomToDto } from "src/rooms/util/map-room-to-dto";

import { EventsMessages } from "../model/events/events.messages";

@UsePipes(new ValidationPipe())
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
    ) {
        this.logger.setContext(this.constructor.name);
    }

    private hasHostChanged(socketId: string, room: Room) {
        const host = room.members.find(({ isHost }) => isHost);
        return host?.socketId !== socketId;
    }

    private userIsHost(socketId: string, room: Room) {
        if (!socketId) return false;
        return room.members.find((member) => member.socketId === socketId)?.isHost;
    }

    private sendToRoom(socket: Socket, roomId: string, payload: GatewayEvent) {
        return socket.broadcast.to(roomId).emit("event", payload);
    }

    private sendToRoomMember(socketId: string, payload: GatewayEvent) {
        return this.server.to(socketId).emit("event", payload);
    }

    @SubscribeMessage(EventsMessages.ConnectToRoom)
    async onJoin(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: ConnectToRoomInput,
    ) {
        const room = await this.roomsService.connect(socket.id, input);

        if (!room) {
            // TODO handle failure
            return;
        }

        const dto = mapRoomToDto(room, this.userIsHost(socket.id, room));

        const update: RoomUpdatedEvent = {
            opCode: RoomEvent.Updated,
            roomCode: room.code,
            data: {
                room: dto,
            },
        };

        await socket.join(room.code);
        await this.sendToRoom(socket, room.code, update);

        return update;
    }

    @SubscribeMessage(EventsMessages.LeaveRoom)
    async onLeave(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: LeaveRoomInput,
    ) {
        const { roomCode } = input;
        const room = await this.roomsService.leave(socket.id, input);

        const event: RoomExitedEvent = {
            opCode: RoomEvent.Exited,
            roomCode,
            data: {
                reason: RoomExitReason.Left,
            },
        };

        if (!room) {
            // TODO
            // Room has been deleted
            await this.server.in(roomCode).socketsLeave(roomCode);
            return event;
        }

        const update: RoomUpdatedEvent = {
            opCode: RoomEvent.Updated,
            roomCode: room.code,
            data: {
                room: mapRoomToDto(room, false),
            },
        };

        if (this.hasHostChanged(socket.id, room)) {
        }

        await this.sendToRoom(socket, room.code, update);

        return event;
    }

    @SubscribeMessage(EventsMessages.KickFromRoom)
    async onKick(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: KickUserInput,
    ) {
        const { member, room } = await this.roomsService.kick(socket.id, input);

        if (!room) {
            // TODO handle failure
            return;
        }

        const update: RoomUpdatedEvent = {
            opCode: RoomEvent.Updated,
            roomCode: room.code,
            data: {
                room: mapRoomToDto(room),
            },
        };

        await this.sendToRoomMember(member.socketId, {
            opCode: RoomEvent.Exited,
            roomCode: room.code,
            data: {
                reason: RoomExitReason.Kicked,
            },
        });

        await this.server.in(member.socketId).socketsLeave(room.code);

        await this.sendToRoom(socket, room.code, update);

        return update;
    }

    @SubscribeMessage(EventsMessages.ReconnectToRoom)
    async onReconnect(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        oldSocketId: string,
    ) {
        const room = await this.roomsService.reconnect(socket.id, oldSocketId);

        if (!room) {
            // TODO handle failure
            return;
        }

        // TODO handle user in multiple rooms

        const dto = mapRoomToDto(room, this.userIsHost(socket.id, room));

        const update: RoomUpdatedEvent = {
            opCode: RoomEvent.Updated,
            roomCode: room.code,
            data: {
                room: dto,
            },
        };

        await socket.join(room.code);
        await this.sendToRoom(socket, room.code, update);

        return dto;
    }

    @SubscribeMessage(EventsMessages.UpdateHost)
    async onUpdateHost(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: UpdateHostInput,
    ) {
        const room = await this.roomsService.updateHost(socket.id, input);

        if (!room) {
            // TODO handle failure
            return;
        }

        const dto = mapRoomToDto(room);

        const update: RoomUpdatedEvent = {
            opCode: RoomEvent.Updated,
            roomCode: room.code,
            data: {
                room: dto,
            },
        };

        await this.sendToRoom(socket, room.code, update);

        return dto;
    }

    @SubscribeMessage(EventsMessages.LockRoom)
    async onLock(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: LockRoomInput,
    ) {
        const room = await this.roomsService.lock(socket.id, input);

        if (!room) {
            // TODO handle failure
            return;
        }

        const dto = mapRoomToDto(room, this.userIsHost(socket.id, room));

        const update: RoomUpdatedEvent = {
            opCode: RoomEvent.Updated,
            roomCode: room.code,
            data: {
                room: dto,
            },
        };

        await this.sendToRoom(socket, room.code, update);

        return update;
    }

    async handleDisconnect(
        @ConnectedSocket()
        socket: Socket,
    ) {
        const room = await this.roomsService.disconnect(socket.id);

        if (!room) {
            // TODO
            // do nothing, user was not in any rooms
            return;
        }

        const update: RoomUpdatedEvent = {
            opCode: RoomEvent.Updated,
            roomCode: room.code,
            data: {
                room: mapRoomToDto(room, this.userIsHost(socket.id, room)),
            },
        };

        await this.sendToRoom(socket, room.code, update);
    }
}
