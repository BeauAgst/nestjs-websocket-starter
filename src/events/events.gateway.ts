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
    @SubscribeMessage("create_room")
    async handleCreateRoomMessage(
        @ConnectedSocket()
        client: Socket,
        @MessageBody()
        input: CreateRoomInput,
    ) {
        const room = this.roomsService.createRoom(input);

        await client.join(room.id);
        await this.server.to(room.id).emit("ROOM_CREATED", JSON.stringify(room));

        return room;
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("join_room")
    async handleJoinRoomMessage(
        @ConnectedSocket()
        client: Socket,
        @MessageBody()
        input: JoinRoomInput,
    ) {
        const room = this.roomsService.joinRoom(input);

        await client.join(room.id);
        await this.server.to(room.id).emit("ROOM_UPDATED", JSON.stringify(room));

        return room;
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("leave_room")
    async handleLeaveRoomMessage(
        @MessageBody()
        input: LeaveRoomInput,
    ) {
        const { isHost, room, success } = await this.roomsService.leaveRoomWithSocketId(
            input.user.socketId,
        );

        if (!success) return;

        if (isHost) {
            this.server.in(room.id).socketsLeave(room.id);
        } else {
            await this.server.to(room.id).emit("ROOM_UPDATED", JSON.stringify(room));
        }
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
