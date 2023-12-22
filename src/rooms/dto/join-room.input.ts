import { IsString, Length } from "class-validator";

import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "../util/constants";

export class JoinRoomInput {
    @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH)
    @IsString()
    name: string;
}
