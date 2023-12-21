import {
    Controller,
    Get,
    NotFoundException,
    Param,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";

import { RoomsService } from "./rooms.service";

@UsePipes(new ValidationPipe())
@Controller("rooms")
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get(":id")
    getRoom(@Param("id") id: string) {
        const room = this.roomsService.findRoomById(id);

        if (!room) {
            throw new NotFoundException("No room found matching ID");
        }

        return room;
    }
}
