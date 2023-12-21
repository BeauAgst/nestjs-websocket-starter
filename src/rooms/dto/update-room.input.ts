import { Type } from "class-transformer";
import {
    IsAlphanumeric,
    IsString,
    IsUppercase,
    IsUUID,
    Length,
    ValidateNested,
} from "class-validator";

import { ROOM_ID_LENGTH } from "../util/constants";
import { RoomConfigurationInput } from "./room-configuration.input";

export class UpdateRoomInput {
    @Length(ROOM_ID_LENGTH, ROOM_ID_LENGTH)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomId: string;

    @ValidateNested()
    @Type(() => RoomConfigurationInput)
    updates: RoomConfigurationInput;

    @IsUUID()
    userId: string;
}
