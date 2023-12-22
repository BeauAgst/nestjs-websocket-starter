import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    Max,
    Min,
} from "class-validator";

import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "../util/constants";

export class CreateRoomInput {
    @IsNotEmpty()
    @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH)
    @IsString()
    name: string;

    @IsOptional()
    @Max(20)
    @Min(2)
    @IsNumber()
    maxMembers?: number;

    @IsOptional()
    @IsUUID()
    memberId?: string;
}
