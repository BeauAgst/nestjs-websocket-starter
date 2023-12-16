import { IsString } from "class-validator";

export class FindRoomsInput {
    @IsString()
    userId: string;
}
