import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator"
import { UserRole } from "src/generated/prisma/enums"

export class LoginDto {

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string
}
    // @IsNotEmpty()
    // @IsEnum(UserRole)
    // role: UserRole

    // @IsNotEmpty()
    // @IsString()
    // organization: string
