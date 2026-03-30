import { IsNotEmpty, IsString } from "class-validator";

export class CreateClaimDto {

    @IsNotEmpty()
    @IsString()
    patientId: string;
    
    @IsNotEmpty()
    @IsString()
    organizationName: string
}

export class VerifyClaimDto {
    
    @IsNotEmpty()
    @IsString()
    patientId: string;

    @IsNotEmpty()
    @IsString()
    claimCode: string;

    @IsNotEmpty()
    @IsString()
    organizationName: string
}