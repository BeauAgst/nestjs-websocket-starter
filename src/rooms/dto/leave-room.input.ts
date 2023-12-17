import { Type } from "class-transformer";
import { IsAlphanumeric, IsString, IsUppercase, Length, ValidateNested } from "class-validator";
import { User } from "src/model/user.model";

export class LeaveRoomInput {
    @Length(4, 4)
    @IsUppercase()
    @IsAlphanumeric()
    @IsString()
    roomId: string;

    @ValidateNested()
    @Type(() => User)
    user: User;
}
