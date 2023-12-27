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
import { GiveHostInput } from "src/rooms/dto/give-host.input";
import { KickUserInput } from "src/rooms/dto/kick-user.input";
import { LeaveRoomInput } from "src/rooms/dto/leave-room.input";
import { LockRoomInput } from "src/rooms/dto/look-room.input";
import { MembersService } from "src/rooms/members.service";
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
        private readonly membersService: MembersService,
        private readonly roomsService: RoomsService,
    ) {
        this.logger.setContext(this.constructor.name);
    }

    private userIsHost(socketId: string, room: Room) {
        if (!socketId) return false;
        return room.members.find((member) => member.socketId === socketId)?.isHost;
    }

    private broadcast(socket: Socket, roomId: string, payload: GatewayEvent) {
        return socket.broadcast.to(roomId).emit("event", payload);
    }

    @SubscribeMessage(EventsMessages.ConnectToRoom)
    async onJoin(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: ConnectToRoomInput,
    ) {
        const room = await this.membersService.connect(socket.id, input);

        if (!room) {
            // TODO handle failure
            return;
        }

        const dto = mapRoomToDto(room, this.userIsHost(socket.id, room));

        const update: RoomUpdatedEvent = {
            operation: RoomEvent.RoomUpdated,
            data: {
                room: dto,
            },
        };

        await socket.join(room.code);
        await this.broadcast(socket, room.code, update);

        return update;
    }

    @SubscribeMessage(EventsMessages.LeaveRoom)
    async onLeave(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: LeaveRoomInput,
    ) {
        const room = await this.membersService.leave(socket.id, input);

        if (!room) {
            // TODO handle failure
            return;
        }

        if (!room.members.length) {
            await this.roomsService.delete(input.roomCode);
            await this.server.in(input.roomCode).socketsLeave(input.roomCode);
        }

        const update: RoomUpdatedEvent = {
            operation: RoomEvent.RoomUpdated,
            data: {
                room: mapRoomToDto(room, this.userIsHost(socket.id, room)),
            },
        };

        await this.broadcast(socket, room.code, update);

        const event: RoomExitedEvent = {
            operation: RoomEvent.RoomExited,
            data: {
                reason: RoomExitReason.Left,
            },
        };

        return event;
    }

    @SubscribeMessage(EventsMessages.KickFromRoom)
    async onKick(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: KickUserInput,
    ) {
        const room = await this.membersService.kick(socket.id, input);

        if (!room) {
            // TODO handle failure
            return;
        }

        const update: RoomUpdatedEvent = {
            operation: RoomEvent.RoomUpdated,
            data: {
                room: mapRoomToDto(room, this.userIsHost(socket.id, room)),
            },
        };

        const event: RoomExitedEvent = {
            operation: RoomEvent.RoomExited,
            data: {
                reason: RoomExitReason.Kicked,
            },
        };

        await this.server.to(input.socketIdToKick).emit("event", event);
        await this.server.in(input.socketIdToKick).socketsLeave(room.code);
        await this.broadcast(socket, room.code, update);

        return update;
    }

    @SubscribeMessage(EventsMessages.ReconnectToRoom)
    async onReconnect(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        oldSocketId: string,
    ) {
        const room = await this.membersService.reconnect(socket.id, oldSocketId);

        if (!room) {
            // TODO handle failure
            return;
        }

        // TODO handle user in multiple rooms

        const dto = mapRoomToDto(room, this.userIsHost(socket.id, room));

        const update: RoomUpdatedEvent = {
            operation: RoomEvent.RoomUpdated,
            data: {
                room: dto,
            },
        };

        await socket.join(room.code);
        await this.broadcast(socket, room.code, update);

        return dto;
    }

    @SubscribeMessage(EventsMessages.GiveHost)
    async onGiveHost(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: GiveHostInput,
    ) {
        const room = await this.membersService.giveHost(socket.id, input);

        if (!room) {
            // TODO handle failure
            return;
        }

        const dto = mapRoomToDto(room, this.userIsHost(socket.id, room));

        const update: RoomUpdatedEvent = {
            operation: RoomEvent.RoomUpdated,
            data: {
                room: dto,
            },
        };

        await this.broadcast(socket, room.code, update);

        return dto;
    }

    @SubscribeMessage(EventsMessages.LockRoom)
    async onLock(
        @ConnectedSocket()
        socket: Socket,
        @MessageBody()
        input: LockRoomInput,
    ) {
        const room = await this.membersService.lockRoom(socket.id, input);

        if (!room) {
            // TODO handle failure
            return;
        }

        const dto = mapRoomToDto(room, this.userIsHost(socket.id, room));

        const update: RoomUpdatedEvent = {
            operation: RoomEvent.RoomUpdated,
            data: {
                room: dto,
            },
        };

        await this.broadcast(socket, room.code, update);

        return update;
    }

    async handleDisconnect(
        @ConnectedSocket()
        socket: Socket,
    ) {
        const room = await this.membersService.disconnect(socket.id);

        if (!room) {
            // TODO
            // do nothing, user was not in any rooms
            return;
        }

        const update: RoomUpdatedEvent = {
            operation: RoomEvent.RoomUpdated,
            data: {
                room: mapRoomToDto(room, this.userIsHost(socket.id, room)),
            },
        };

        await this.broadcast(socket, room.code, update);
    }
}
