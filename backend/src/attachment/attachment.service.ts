import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { AttachmentDto } from './dto/AttachmentDto';

@Injectable()
export class AttachmentService {
    constructor(
        private prisma: PrismaService,
        private storage: StorageService,
    ) {}

    async uploadRecords(
        dto: AttachmentDto,
        organizationId: string,
        doctorId: string,
    ) {

        const doctor = await this.prisma.staffProfile.findUnique({
            where: {userId: doctorId},
            select: {
                id: true,
            }
        });

        if (!doctor){
            throw new ForbiddenException("User does not have a valid Staff Profile to perform uploads.");
        }

        const medicalRecord = await this.prisma.medicalRecord.findUnique({
            where: {
                id: dto.recordId,
            },
            select: {
                patientId: true,
            }
        })

        if (!medicalRecord) {
            throw new BadRequestException("Inappropriate Patient ID")
        }

        const fileKey = this.storage.generateKey(
            organizationId, 
            dto.patientId, 
            dto.fileName,
        );

        const attachment = await this.prisma.attachment.create({
            data: {
                patientId: medicalRecord.patientId,
                fileName: dto.fileName,
                fileSize: dto.fileSize,
                mimeType: dto.mimeType,
                recordId: dto.recordId,
                fileKey: fileKey,
                organizationId: organizationId,
                uploadedById: doctor.id,
            },
            select: {
                id: true
            }
        });

        const uploadUrl = await this.storage.getUploadUrl(fileKey, dto.mimeType);

        return { uploadUrl, attachmentId: attachment.id};
    }
}
