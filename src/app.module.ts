import { Module } from "@nestjs/common";
import { EventsModule } from "./events/events.module";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { RoomsModule } from "./rooms/rooms.module";
import { DirectiveLocation, GraphQLDirective } from "graphql";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "./config/config.module";

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forRoot("mongodb://localhost:27017/test"),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: "schema.gql",
            installSubscriptionHandlers: true,
            buildSchemaOptions: {
                directives: [
                    new GraphQLDirective({
                        name: "upper",
                        locations: [DirectiveLocation.FIELD_DEFINITION],
                    }),
                ],
            },
        }),
        EventsModule,
        RoomsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
