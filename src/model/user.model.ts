import { IsNotEmpty, IsString, IsUUID, Length } from "class-validator";

export class User {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @Length(2, 20)
    @IsString()
    name: string;

    @Length(20, 20)
    @IsString()
    socketId: string;
}
