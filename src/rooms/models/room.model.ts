import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType({ description: 'Contains information about a websocket "room"' })
export class Room {
    @Field(() => Int, { description: "The room ID" })
    id: number;

    @Field(() => Int, {
        description: "The maximum number of uses allowed in the room concurrently",
    })
    maxUsers: number;

    @Field({ description: "The passphrase required to enter the room" })
    passphrase: string;
}
