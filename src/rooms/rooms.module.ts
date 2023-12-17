import { Module } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { RoomsController } from "./rooms.controller";

@Module({
    controllers: [RoomsController],
    exports: [RoomsService],
    providers: [RoomsService],
})
export class RoomsModule {}
