import { IsAlphanumeric, IsString, IsUppercase, Length, MinLength } from "class-validator";

import { ROOM_CODE_LENGTH } from "../util/constants";

export class ConnectToRoomInput {
    @MinLength(1)
    @IsString()
    memberId: string;

    @Length(ROOM_CODE_LENGTH, ROOM_CODE_LENGTH)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomCode: string;
}
