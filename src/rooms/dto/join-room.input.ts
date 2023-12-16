import { Field, InputType } from "@nestjs/graphql";
import { IsMongoId, IsString, Length } from "class-validator";

@InputType()
export class JoinRoomInput {
    @Field({ description: "The passphrase to enter the room" })
    @Length(4, 4)
    @IsString()
    passphrase: string;

    @Field({ description: "The user ID" })
    @IsMongoId()
    userId: string;
}
