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
import type { RoomEventPayload, RoomUpdatedEvent } from "src/model/events/room.event";
import { RoomEvent } from "src/model/events/room.event";
import { ConnectToRoomInput } from "src/rooms/dto/connect-to-room.input";
import { GiveHostInput } from "src/rooms/dto/give-host.input";
import { KickUserInput } from "src/rooms/dto/kick-user.input";
import { LeaveRoomInput } from "src/rooms/dto/leave-room.input";
import { LockRoomInput } from "src/rooms/dto/look-room.input";
import { MembersService } from "src/rooms/members.service";
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
    ) {
        this.logger.setContext(this.constructor.name);
    }

    private broadcast(socket: Socket, roomId: string, payload: RoomEventPayload) {
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

        const dto = mapRoomToDto(room);

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

        const update: RoomUpdatedEvent = {
            operation: RoomEvent.RoomUpdated,
            data: {
                room: mapRoomToDto(room),
            },
        };

        await this.broadcast(socket, room.code, update);

        // TODO return room closed operation
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
                room: mapRoomToDto(room),
            },
        };

        await this.server.to(input.socketIdToKick).emit("event", "You've been kicked fam");
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

        const dto = mapRoomToDto(room);

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

        const dto = mapRoomToDto(room);

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

        const dto = mapRoomToDto(room);

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

        // TODO
        // do nothing, user was in rooms and successfully disconnected
    }
}
