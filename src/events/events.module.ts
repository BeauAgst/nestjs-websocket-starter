import { Module } from "@nestjs/common";

import { RoomsModule } from "../rooms/rooms.module";
import { EventsGateway } from "./events.gateway";

@Module({
    imports: [RoomsModule],
    providers: [EventsGateway],
})
export class EventsModule {}
