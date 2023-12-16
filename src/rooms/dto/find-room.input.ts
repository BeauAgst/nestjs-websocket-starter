import { IsString, IsUUID } from "class-validator";

export class FindRoomInput {
    @IsUUID()
    roomId: string;

    @IsString()
    userId: string;
}
