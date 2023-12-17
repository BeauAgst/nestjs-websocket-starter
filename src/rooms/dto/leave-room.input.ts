import { Type } from "class-transformer";
import { Length, ValidateNested } from "class-validator";
import { User } from "src/model/user.model";

export class LeaveRoomInput {
    @Length(4, 4)
    roomId: string;

    @ValidateNested()
    @Type(() => User)
    user: User;
}
