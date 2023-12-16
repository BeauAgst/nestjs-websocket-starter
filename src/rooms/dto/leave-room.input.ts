import { Type } from "class-transformer";
import { IsUUID, ValidateNested } from "class-validator";
import { User } from "src/model/user.model";

export class LeaveRoomInput {
    @IsUUID()
    roomId: string;

    @ValidateNested()
    @Type(() => User)
    user: User;
}
