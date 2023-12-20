import { Type } from "class-transformer";
import { IsAlphanumeric, IsString, IsUppercase, Length, ValidateNested } from "class-validator";

import { ROOM_ID_LENGTH } from "../util/constants";
import { UserInput } from "./user.input";

export class JoinRoomInput {
    @Length(ROOM_ID_LENGTH, ROOM_ID_LENGTH)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomId: string;

    @ValidateNested()
    @Type(() => UserInput)
    user: UserInput;
}
