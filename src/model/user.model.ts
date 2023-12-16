import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class User {
    @IsNotEmpty()
    @IsString()
    id: string;

    @MinLength(2)
    @IsString()
    name: string;
}
