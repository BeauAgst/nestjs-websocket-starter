import { Type } from "class-transformer";
import {
    IsAlphanumeric,
    IsString,
    IsUppercase,
    IsUUID,
    Length,
    ValidateNested,
} from "class-validator";

import { ROOM_CODE_LENGTH } from "../util/constants";
import { RoomConfigurationInput } from "./room-configuration.input";

export class UpdateRoomInput {
    @Length(ROOM_CODE_LENGTH, ROOM_CODE_LENGTH)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomCode: string;

    @ValidateNested()
    @Type(() => RoomConfigurationInput)
    updates: RoomConfigurationInput;

    @IsUUID()
    userId: string;
}
