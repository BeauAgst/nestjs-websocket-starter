import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LoggerModule } from "nestjs-pino";

import { ConfigModule } from "./config/config.module";
import { EventsModule } from "./events/events.module";
import { RoomsModule } from "./rooms/rooms.module";

@Module({
    imports: [
        MongooseModule.forRoot("mongodb://localhost:27017/test"),
        ConfigModule,
        LoggerModule.forRoot(),
        EventsModule,
        RoomsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
