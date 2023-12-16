import { Field, InputType } from "@nestjs/graphql";
import { IsMongoId, IsString } from "class-validator";

@InputType()
export class FindRoomInput {
    @Field()
    @IsMongoId()
    roomId: string;

    @Field()
    @IsString()
    roomOwnerId: string;
}
