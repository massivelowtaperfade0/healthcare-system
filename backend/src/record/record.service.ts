import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecordDto } from './dto/RecordDto';
import { v4 as uuidv4 } from 'uuid'
import { MEDICAL_TEMPLATES } from 'src/common/templates.constants';

export interface SoapContent {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

@Injectable()
export class RecordService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async addMedicalRecord(
        dto: RecordDto,
        doctorId: string,
        organizationId: string,
    ) {
        const patient = await this.prisma.patient.findUnique({
            where: {
                puid_organizationId: {
                    puid: dto.patientId,
                    organizationId,
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            }
        });

        if (!patient) {
            throw new NotFoundException('Patient not found in this organization');
        }

        const staff = await this.prisma.staffProfile.findUnique({
            where: {
                userId: doctorId,
            },
            select: { id: true },
        });

        if (!staff) {
            throw new ForbiddenException("You do not have appropriate staff profile to create record")
        }

        return await this.prisma.$transaction(async (tx) => {

            // if dto.record exists, fetch the id against it
            // else set it to null
            const existing = dto.recordId
                ? await tx.medicalRecord.findUnique({
                    where: { id: dto.recordId },
                    select: {
                        id: true,
                        isLocked: true,
                        content: true,
                    }
                })
                : null


            if (existing) {
                if (existing.isLocked) {
                    await tx.activityLog.create({
                        data: {
                            userId: doctorId,
                            eventType: EventType.RECORD_UPDATE_UNAUTHORIZED,
                            organizationId: organizationId,
                            metadata: {
                                action: "Attempt to update an locked record",
                                record: dto.recordId,
                                actor: doctorId,
                            }
                        }
                    })
                    throw new ForbiddenException("Cannot edit a locked medical record");
                }

                const updatedMedicalRecord = await tx.medicalRecord.update({
                    where: { id: existing.id },
                    data: {
                        content: {
                            ...existing.content as object,
                            ...dto.content
                        },
                        updatedAt: new Date(),
                    }
                });

                await tx.activityLog.create({
                    data: {
                        userId: doctorId,
                        eventType: EventType.RECORD_UPDATE_AUTHORIZED,
                        organizationId: organizationId,
                        metadata: {
                            action: "Performed changes to newly created record",
                            record: dto.recordId,
                            actor: doctorId,
                        }
                    }
                })

                return updatedMedicalRecord;
            }

            const fallbackId = dto.recordId || uuidv4();

            const template = MEDICAL_TEMPLATES[dto.type] || MEDICAL_TEMPLATES.SOAP;

            let cleanContext = dto.initialContext || {};

            // If it's a string, we keep parsing it until it becomes a real object!
            while (typeof cleanContext === 'string') {
                try {
                    cleanContext = JSON.parse(cleanContext);
                } catch (e) {
                    // If it fails to parse, it wasn't valid JSON anyway
                    cleanContext = {};
                    break;
                }
            }

            // Merge manually. Do NOT use spread operators (...) on the cleanContext!
            const mergedContent = { ...template };
            if (typeof cleanContext === 'object' && cleanContext !== null) {
                Object.keys(cleanContext).forEach((key) => {
                    mergedContent[key] = cleanContext[key];
                });
            }

            const mergeContent = Object.assign({}, template, cleanContext);

            const newMedicalRecord = await tx.medicalRecord.create({
                data: {
                    id: fallbackId,
                    patientId: patient.id,
                    organizationId,
                    staffProfileId: staff.id,
                    type: dto.type,
                    content: mergeContent,
                }
            })

            await tx.activityLog.create({
                data: {
                    userId: doctorId,
                    eventType: EventType.PATIENT_RECORD_CREATED,
                    organizationId: organizationId,
                    metadata: {
                        action: "Created a new patient record",
                    }
                }
            })

            return newMedicalRecord;
        });
    }
}
