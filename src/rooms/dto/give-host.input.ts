import { IsAlphanumeric, IsString, IsUppercase, Length } from "class-validator";

import { ROOM_CODE_LENGTH } from "../util/constants";

export class GiveHostInput {
    @Length(ROOM_CODE_LENGTH, ROOM_CODE_LENGTH)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomCode: string;

    @IsString()
    secret: string;

    @IsString()
    socketIdToHost: string;
}
