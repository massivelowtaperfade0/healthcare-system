import { IsEnum, IsJSON, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { RecordType } from "src/generated/prisma/enums";
import { Type } from 'class-transformer';
import type { SoapContent } from "../record.service";

export class SoapContentDto {
    @IsOptional()
    @IsString()
    subjective?: string;

    @IsOptional()
    @IsString()
    objective?: string;

    @IsOptional()
    @IsString()
    assessment?: string;

    @IsOptional()
    @IsString()
    plan?: string;
}

export class RecordDto {

    @IsOptional()
    @IsUUID()
    recordId: string;

    @IsNotEmpty()
    @IsString()
    patientId: string;

    @IsNotEmpty()
    @IsUUID()
    organizationId: string;

    @IsNotEmpty()
    @IsEnum(RecordType)
    type: RecordType

    @IsOptional()
    @ValidateNested()
    @Type(() => SoapContentDto) 
    content?: SoapContentDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => SoapContentDto)
    initialContext?: SoapContentDto;
}