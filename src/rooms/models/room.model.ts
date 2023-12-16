import { Field, GraphQLISODateTime, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType({ description: 'Contains information about a websocket "room"' })
export class Room {
    @Field(() => GraphQLISODateTime, { description: "When the room was created" })
    createdAt: Date;

    @Field(() => ID, { description: "The room ID" })
    id: string;

    @Field({ description: "Whether the user is the room owner or not" })
    isRoomOwner: boolean;

    @Field(() => Int, {
        description: "The maximum number of uses allowed in the room concurrently",
        nullable: true,
    })
    maxUsers?: number;

    @Field({ description: "The passphrase required to enter the room" })
    passphrase: string;

    @Field(() => GraphQLISODateTime, { description: "When the room was last updated" })
    updatedAt: Date;
}
