import { IsNotEmpty, IsString, IsUUID, MinLength } from "class-validator";

export class User {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @MinLength(2)
    @IsString()
    name: string;
}
