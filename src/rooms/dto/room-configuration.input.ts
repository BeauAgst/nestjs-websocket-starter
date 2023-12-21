import { IsBoolean, IsNumber, IsOptional, Max, Min } from "class-validator";

export class RoomConfigurationInput {
    @IsOptional()
    @IsBoolean()
    isLocked?: boolean;

    @IsOptional()
    @Max(20)
    @Min(2)
    @IsNumber()
    maxMembers?: number;
}
