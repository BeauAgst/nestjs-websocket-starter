import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { PinoLogger } from "nestjs-pino";
import { Server, Socket } from "socket.io";
import { RoomsService } from "src/rooms/rooms.service";
import { JoinRoomInput } from "src/rooms/dto/join-room.input";
import { CreateRoomInput } from "src/rooms/dto/create-room.input";
import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { BadRequestTransformationFilter } from "src/filters/bad-request-exception-transformation.filter";
import { LeaveRoomInput } from "src/rooms/dto/leave-room.input";
import { ToggleLockRoomInput } from "src/rooms/dto/toggle-lock-room.input";

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
    ) {
        this.logger.setContext(this.constructor.name);
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("CREATE_ROOM")
    async handleCreateRoomMessage(
        @ConnectedSocket()
        client: Socket,
        @MessageBody()
        input: CreateRoomInput,
    ) {
        const room = this.roomsService.createRoom(input);

        await client.join(room.id);

        return room;
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("JOIN_ROOM")
    async handleJoinRoomMessage(
        @ConnectedSocket()
        client: Socket,
        @MessageBody()
        input: JoinRoomInput,
    ) {
        const room = this.roomsService.joinRoom(input);

        await client.join(room.id);
        await client.broadcast.to(room.id).emit("ROOM_UPDATED", JSON.stringify(room));

        return room;
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("LEAVE_ROOM")
    async handleLeaveRoomMessage(
        @ConnectedSocket()
        client: Socket,
        @MessageBody()
        input: LeaveRoomInput,
    ) {
        const { isHost, room, success } = await this.roomsService.leaveRoomWithSocketId(
            input.user.socketId,
        );

        if (!success) return { success: false };

        if (isHost) {
            this.server.in(room.id).socketsLeave(room.id);
        } else {
            await client.leave(room.id);
            await this.server.to(room.id).emit("ROOM_UPDATED", JSON.stringify(room));
        }

        return { success: true };
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("TOGGLE_ROOM_LOCKED_STATE")
    async handleLockRoomMessage(
        @ConnectedSocket()
        client: Socket,
        @MessageBody()
        input: ToggleLockRoomInput,
    ) {
        const room = this.roomsService.toggleRoomLockedState(input);

        await client.broadcast.to(room.id).emit("ROOM_UPDATED", JSON.stringify(room));

        return room;
    }

    async handleDisconnect(socket: Socket): Promise<void> {
        this.logger.info({ socketId: socket.id }, "Socket disconnected");
        const { isHost, room, success } = await this.roomsService.leaveRoomWithSocketId(socket.id);

        if (!success) return;

        if (isHost) {
            this.server.in(room.id).socketsLeave(room.id);
        } else {
            await this.server.to(room.id).emit("ROOM_UPDATED", JSON.stringify(room));
        }
    }
}
