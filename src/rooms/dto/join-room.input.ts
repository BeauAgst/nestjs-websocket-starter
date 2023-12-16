import { Field, InputType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";

@InputType()
export class JoinRoomInput {
    @Field({ description: "The passphrase to enter the room" })
    @Length(4, 4)
    @IsString()
    passphrase: string;

    @Field({ description: "The user ID" })
    @IsString()
    userId: string;
}
