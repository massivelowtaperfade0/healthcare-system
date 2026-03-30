import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PatientDto {

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsDateString()
    DOB: Date

    @IsNotEmpty()
    @IsDateString()
    admittedAt: Date;

    @IsOptional()
    @IsDateString()
    dischargedAt: Date;
}