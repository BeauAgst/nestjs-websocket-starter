import { IsAlphanumeric, IsString, IsUppercase, IsUUID, Length } from "class-validator";

import { ROOM_ID_LENGTH } from "../util/constants";

export class LeaveRoomInput {
    @Length(ROOM_ID_LENGTH, ROOM_ID_LENGTH)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomId: string;

    @IsUUID()
    userId: string;
}
