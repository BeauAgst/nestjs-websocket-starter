import { IsAlphanumeric, IsNotEmpty, IsString, IsUppercase, IsUUID, Length } from "class-validator";
import { IsUserRoomHost } from "src/validators/is-user-room-host.decorator";

import { ROOM_ID_LENGTH } from "../util/constants";

export class PassRoomOwnershipInput {
    @IsUUID()
    newHostId: string;

    @Length(ROOM_ID_LENGTH, ROOM_ID_LENGTH)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomId: string;

    @IsNotEmpty()
    @IsUserRoomHost()
    @IsUUID()
    userId: string;
}
