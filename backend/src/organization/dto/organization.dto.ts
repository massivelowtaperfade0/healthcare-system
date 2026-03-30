import { IsNotEmpty, IsString } from "class-validator";

export class OrganizationDto {

    @IsNotEmpty()
    @IsString()
    name: string;
}