import { Module } from "@nestjs/common";
import { RoomsResolver } from "./rooms.resolver";
import { RoomsService } from "./rooms.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Room, RoomSchema } from "./schema/room.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }])],
    providers: [RoomsResolver, RoomsService],
})
export class RoomsModule {}
