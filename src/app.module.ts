import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

import { ConfigModule } from "./config/config.module";
import { EventsModule } from "./events/events.module";
import { RoomsModule } from "./rooms/rooms.module";
import { UsersModule } from "./users/users.module";
import { IsUserRoomHost } from "./validators/is-user-room-host.validator";

const VALIDATORS = [IsUserRoomHost];
@Module({
    imports: [ConfigModule, LoggerModule.forRoot(), EventsModule, RoomsModule, UsersModule],
    controllers: [],
    providers: [...VALIDATORS],
})
export class AppModule {}
