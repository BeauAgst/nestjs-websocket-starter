import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import { RoomsModule } from "../rooms/rooms.module";

@Module({
    imports: [RoomsModule],
    providers: [EventsGateway],
})
export class EventsModule {}
