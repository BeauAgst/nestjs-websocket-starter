import { Field, InputType } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString, Max } from "class-validator";

@InputType()
export class CreateRoomInput {
    @Field({ description: "The maximum number of users allowed to join the room", nullable: true })
    @IsOptional()
    @Max(20)
    @IsNumber()
    maxUsers?: number;

    @Field({ description: "The user ID" })
    @IsString()
    userId: string;
}
