import { IsAlphanumeric, IsString, IsUppercase, Length, ValidateNested } from "class-validator";
import { User } from "../../model/user.model";
import { Type } from "class-transformer";

export class JoinRoomInput {
    @Length(4, 4)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomId: string;

    @ValidateNested()
    @Type(() => User)
    user: User;
}
