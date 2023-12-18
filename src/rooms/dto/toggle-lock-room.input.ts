import { Type } from "class-transformer";
import { IsAlphanumeric, IsString, IsUppercase, Length, ValidateNested } from "class-validator";

import { UserInput } from "./user.input";

export class ToggleLockRoomInput {
    @Length(4, 4)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomId: string;

    @ValidateNested()
    @Type(() => UserInput)
    user: UserInput;
}
