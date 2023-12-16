import { IsNumber, IsOptional, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { User } from "../../model/user.model";

export class CreateRoomInput {
    @IsOptional()
    @Max(20)
    @Min(0)
    @IsNumber()
    maxUsers?: number;

    @ValidateNested()
    @Type(() => User)
    user: User;
}
