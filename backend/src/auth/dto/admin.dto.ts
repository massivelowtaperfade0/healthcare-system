import { UserRole } from "src/generated/prisma/enums";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class AdminDto {

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsStrongPassword()
    password: string;

    @IsOptional()
    @IsString()
    firstName: string

    @IsOptional()
    @IsString()
    lastName: string

    @IsNotEmpty()
    @IsString()
    organization: string

    // @IsNotEmpty()
    // @IsEnum(UserRole)
    // role: UserRole
}