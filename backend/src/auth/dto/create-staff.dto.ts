import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UserRole } from "src/generated/prisma/enums";

export class CreateStaffDto {

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

    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole;

    @IsNotEmpty()
    @IsString()
    licenseNumber: string;
}