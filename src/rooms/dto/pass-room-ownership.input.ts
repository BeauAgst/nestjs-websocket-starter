import { Type } from "class-transformer";
import { IsString, Length, ValidateNested } from "class-validator";

import { UserInput } from "./user.input";

export class PassRoomOwnershipInput {
    @Length(4, 4)
    @IsString()
    roomId: string;

    @ValidateNested()
    @Type(() => UserInput)
    user: UserInput;

    @ValidateNested()
    @Type(() => UserInput)
    newHost: UserInput;
}
