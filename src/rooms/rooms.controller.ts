import {
    Body,
    Controller,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";

import { CreateRoomInput } from "./dto/create-room.input";
import { JoinRoomInput } from "./dto/join-room.input";
import type { JoinedRoomDtoModel } from "./dto/joined-room-dto.model";
import type { RoomDtoModel } from "./dto/room-dto.model";
import { RoomsService } from "./rooms.service";
import { mapMemberToDto } from "./util/map-member-to-dto";
import { mapRoomToDto } from "./util/map-room-to-dto";
@UsePipes(new ValidationPipe())
@Controller("rooms")
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @HttpCode(201)
    @Post()
    async create(@Body() body: CreateRoomInput): Promise<RoomDtoModel> {
        const room = await this.roomsService.create(body);
        return mapRoomToDto(room);
    }

    @HttpCode(200)
    @Post(":code/join")
    async join(
        @Body() body: JoinRoomInput,
        @Param("code") code: string,
    ): Promise<JoinedRoomDtoModel> {
        const member = await this.roomsService.join(code, body);
        if (!member) throw new NotFoundException("Room not found");

        const room = await this.roomsService.getByMemberId(member.id);
        if (!room) throw new NotFoundException("Room not found");

        return {
            member: mapMemberToDto(member),
            room: mapRoomToDto(room),
        };
    }

    @HttpCode(200)
    @Get(":code")
    async get(@Param("code") code: string) {
        const room = await this.roomsService.getByCode(code);
        if (!room) throw new NotFoundException("Room not found");

        return mapRoomToDto(room);
    }

    @HttpCode(200)
    @Get(":code/exists")
    async exists(@Param("code") code: string) {
        const room = await this.roomsService.getByCode(code);
        return !!room;
    }
}
