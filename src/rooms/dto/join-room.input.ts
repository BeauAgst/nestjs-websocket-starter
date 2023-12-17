import { IsAlphanumeric, IsString, IsUppercase, Length, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UserInput } from "./user.input";

export class JoinRoomInput {
    @Length(4, 4)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomId: string;

    @ValidateNested()
    @Type(() => UserInput)
    user: UserInput;
}
