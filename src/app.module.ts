import { Module } from "@nestjs/common";
import { EventsModule } from "./events/events.module";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { RoomsModule } from "./rooms/rooms.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "./config/config.module";
import { LoggerModule } from "nestjs-pino";

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forRoot("mongodb://localhost:27017/test"),
        LoggerModule.forRoot(),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            autoSchemaFile: "schema.gql",
            context: ({ req, res }) => ({ req, res }),
            driver: ApolloDriver,
            installSubscriptionHandlers: true,
        }),
        EventsModule,
        RoomsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
