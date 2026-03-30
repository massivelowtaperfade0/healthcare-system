import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UserRole } from "src/generated/prisma/enums";

export class RegisterDto {

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    // @IsNotEmpty()
    // @IsString()
    // organization: string

}