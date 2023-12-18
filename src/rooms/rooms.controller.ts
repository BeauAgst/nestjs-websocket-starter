import { Controller, Get, NotFoundException, Param } from "@nestjs/common";

import { SuccessModel } from "../model/success.model";
import { RoomsService } from "./rooms.service";

@Controller("rooms")
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get(":id")
    getRoom(@Param("id") id: string): SuccessModel {
        const result = this.roomsService.findRoom(id);

        if (!result.success) {
            throw new NotFoundException(result.message);
        }

        return { success: true };
    }
}
