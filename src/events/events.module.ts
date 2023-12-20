import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";

import { RoomsModule } from "../rooms/rooms.module";
import { EventsGateway } from "./events.gateway";

@Module({
    imports: [RoomsModule, UsersModule],
    providers: [EventsGateway],
})
export class EventsModule {}
