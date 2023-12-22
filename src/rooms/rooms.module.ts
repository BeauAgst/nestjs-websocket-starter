import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { MembersService } from "./members.service";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { Member, MemberSchema } from "./schema/member.schema";
import { Room, RoomSchema } from "./schema/room.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Member.name, schema: MemberSchema },
            { name: Room.name, schema: RoomSchema },
        ]),
    ],
    controllers: [RoomsController],
    exports: [MembersService, RoomsService],
    providers: [MembersService, RoomsService],
})
export class RoomsModule {}
