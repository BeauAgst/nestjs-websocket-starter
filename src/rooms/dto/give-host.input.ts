import { IsAlphanumeric, IsString, IsUppercase, Length, MinLength } from "class-validator";

import { ROOM_CODE_LENGTH } from "../util/constants";

export class GiveHostInput {
    @Length(ROOM_CODE_LENGTH, ROOM_CODE_LENGTH)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomCode: string;

    @MinLength(1)
    @IsString()
    secret: string;

    @MinLength(1)
    @IsString()
    socketIdToHost: string;
}
