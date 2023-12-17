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
import { FindRoomsInput } from "src/rooms/dto/find-rooms.input";
import { LeaveRoomInput } from "src/rooms/dto/leave-room.input";

@UseFilters(BadRequestTransformationFilter)
@WebSocketGateway({
    cors: {
        origin: "*",
    },
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
    handleCreateRoomMessage(
        @ConnectedSocket()
        client: Socket,
        @MessageBody()
        input: CreateRoomInput,
    ) {
        return this.roomsService.createRoom(input, client);
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("find_rooms")
    handleFindRoomsMessage(
        @MessageBody()
        input: FindRoomsInput,
    ) {
        return this.roomsService.findRoomsForUser(input);
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("join_room")
    handleJoinRoomMessage(
        @ConnectedSocket()
        client: Socket,
        @MessageBody()
        input: JoinRoomInput,
    ) {
        return this.roomsService.joinRoom(input, client);
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage("leave_room")
    handleLeaveRoomMessage(
        @MessageBody()
        input: LeaveRoomInput,
    ) {
        return this.roomsService.leaveRoom(input);
    }

    handleDisconnect(client: Socket) {}
}
