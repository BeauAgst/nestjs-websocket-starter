import { Field, InputType } from "@nestjs/graphql";
import { IsMongoId, IsString } from "class-validator";

@InputType()
export class FindRoomInput {
    @Field({ description: "The ID of the room" })
    @IsMongoId()
    roomId: string;

    @Field({ description: "The user ID" })
    @IsString()
    userId: string;
}
