import { Module } from "@nestjs/common";

import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { RoomsStore } from "./rooms.store";
import { UserRoomsStore } from "./user-rooms.store";

@Module({
    controllers: [RoomsController],
    exports: [RoomsService],
    providers: [RoomsService, RoomsStore, UserRoomsStore],
})
export class RoomsModule {}
