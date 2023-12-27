import { IsOptional, IsString, Length, MinLength } from "class-validator";

import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "../util/constants";

export class JoinRoomInput {
    @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH)
    @IsString()
    name: string;

    @IsOptional()
    @MinLength(1)
    @IsString()
    memberId?: string;
}
