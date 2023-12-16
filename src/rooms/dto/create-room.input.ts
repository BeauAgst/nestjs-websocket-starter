import { Field, InputType } from "@nestjs/graphql";
import { IsMongoId, IsNumber, IsOptional, Max } from "class-validator";

@InputType()
export class CreateRoomInput {
    @Field()
    @IsMongoId()
    roomOwnerId: string;

    @Field({ nullable: true })
    @IsOptional()
    @Max(20)
    @IsNumber()
    maxUsers?: number;
}
