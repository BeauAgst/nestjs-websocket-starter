import { IsString, Length, ValidateNested } from "class-validator";
import { User } from "../../model/user.model";
import { Type } from "class-transformer";

export class JoinRoomInput {
    @Length(4, 4)
    @IsString()
    roomId: string;

    @ValidateNested()
    @Type(() => User)
    user: User;
}
