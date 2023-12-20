import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from "class-validator";

export class UserInput {
    @IsOptional()
    @IsUUID()
    id?: string;

    @IsNotEmpty()
    @Length(2, 20)
    @IsString()
    name: string;

    @IsNotEmpty()
    @Length(20, 20)
    @IsString()
    socketId: string;
}
