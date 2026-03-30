import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SetUpOrganizationDto {

    @IsNotEmpty()
    @IsString()
    organization: string;

    @IsOptional()
    @IsString()
    firstName: string;

    @IsOptional()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    city: string

    @IsNotEmpty()
    @IsString()
    state: string
    
    @IsNotEmpty()
    @IsString()
    country: string
    
}