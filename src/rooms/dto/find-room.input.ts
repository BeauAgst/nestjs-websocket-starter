import { Field, InputType } from "@nestjs/graphql";
import { IsMongoId } from "class-validator";

@InputType()
export class FindRoomInput {
    @Field({ description: "The ID of the room" })
    @IsMongoId()
    roomId: string;

    @Field({ description: "The user ID" })
    @IsMongoId()
    userId: string;
}
