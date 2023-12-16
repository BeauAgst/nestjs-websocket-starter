import { Module } from "@nestjs/common";
import { EventsModule } from "./events/events.module";
import { RoomsModule } from "./rooms/rooms.module";
import { ConfigModule } from "./config/config.module";
import { LoggerModule } from "nestjs-pino";

@Module({
    imports: [ConfigModule, LoggerModule.forRoot(), EventsModule, RoomsModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
