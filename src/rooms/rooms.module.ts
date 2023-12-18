import { Module } from "@nestjs/common";

import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";

@Module({
    controllers: [RoomsController],
    exports: [RoomsService],
    providers: [RoomsService],
})
export class RoomsModule {}
