import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from "class-validator";

export class AttachmentDto {

    // @IsUUID()
    @IsNotEmpty()
    patientId: string;

    @IsString()
    @IsNotEmpty()
    fileName: string;

    @IsInt()
    @Min(1)
    fileSize: number;

    @IsString()
    @IsNotEmpty()
    mimeType: string;

    // @IsUUID()
    @IsNotEmpty()
    recordId: string;
}