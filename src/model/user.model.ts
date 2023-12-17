import { IsBoolean, IsNotEmpty, IsString, IsUUID, Length } from "class-validator";

export class User {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @IsNotEmpty()
    @IsBoolean()
    isHost: boolean;

    @IsNotEmpty()
    @Length(2, 20)
    @IsString()
    name: string;

    @IsNotEmpty()
    @Length(20, 20)
    @IsString()
    socketId: string;
}
