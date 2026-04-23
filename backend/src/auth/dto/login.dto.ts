import { IsEmail, IsNotEmpty, IsString } from "class-validator"

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
