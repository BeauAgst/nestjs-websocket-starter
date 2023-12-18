import { IsBoolean, IsNumber, IsOptional, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UserInput } from "./user.input";

export class CreateRoomInput {
    @IsOptional()
    @IsBoolean()
    isLocked?: boolean;

    @IsOptional()
    @Max(20)
    @Min(2)
    @IsNumber()
    maxUsers?: number;

    @ValidateNested()
    @Type(() => UserInput)
    user: UserInput;
}
