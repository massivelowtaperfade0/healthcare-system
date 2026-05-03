import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PatientDto } from './dto/patient.dto';
import { EventType, MembershipStatus, UserRole } from '@prisma/client';
import { generatePUID } from 'src/common/puid-generator';

@Injectable()
export class PatientService {
    constructor(
        private prisma: PrismaService
    ) { }

    async addNewPatient(
        dto: PatientDto,
        doctorId: string,
        organizationId: string
    ) {

        const membership = await this.prisma.membership.findUnique({
            select: {
                id: true,
                role: true,
                status: true,
                userId: true,
                organization: {
                    select: {
                        name: true
                    }
                }
            },
            where: {
                userId_organizationId: {
                    userId: doctorId,
                    organizationId,
                }
            }
        });

        if (!membership ||
            membership.role !== UserRole.DOCTOR ||
            membership.status !== MembershipStatus.ACTIVE
        ) {
            await this.prisma.activityLog.create({
                data: {
                    userId: membership?.userId,
                    eventType: EventType.RECORD_WRITE_DENIED,
                    metadata: {
                        reason: "Attempt to create new patient record by unauthorized user",
                        timeStamp: new Date(Date.now()).toISOString()
                    }
                }
            })
            throw new ForbiddenException("Only active doctors of this clinic can add patients");
        }

        const orgPrefix = (membership.organization.name || "ORG")
            .replace(/[^a-zA-Z]/g, '')
            .substring(0, 3)
            .toUpperCase();

        try {
            const puid = generatePUID(orgPrefix);

            return await this.prisma.$transaction(async (tx) => {
                const patient = await tx.patient.create({
                    data: {
                        puid,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        dateOfBirth: dto.DOB,
                        admittedAt: dto.admittedAt,
                        dischargeAt: dto.dischargedAt,
                        organizationId: organizationId,
                    },
                    include: { organization: { select: { name: true } } }
                });

                await tx.activityLog.create({
                    data: {
                        userId: doctorId, // The Doctor's User ID
                        organizationId: organizationId,
                        eventType: EventType.PATIENT_RECORD_CREATED,
                        metadata: {
                            puid: patient.puid,
                            patientId: patient.id
                        }
                    }
                });

                return patient;
            });
        } catch (error) {
            // Handle P2002 (Unique constraint failed) for PUID
            if (error.code === 'P2002' && error.meta?.target?.includes('puid')) {
                // Option: Recursively call once or throw a specific error
                throw new ConflictException("PUID collision detected. Please try again.");
            }
            throw error;
        }
    }

    async getAllPatientsInOrganization(
        userId: string,
        organizationId: string,
        limit?: number,
    ) {

        const membership = await this.prisma.membership.findUnique({
            select: {
                id: true,
                role: true,
                status: true,
                userId: true,
            },
            where: {
                userId_organizationId: {
                    userId,
                    organizationId
                }
            }
        });

        if (!membership ||
            membership.role !== (UserRole.DOCTOR || UserRole.NURSE) ||
            membership.status !== MembershipStatus.ACTIVE
        ) {
            await this.prisma.activityLog.create({
                data: {
                    userId: membership?.userId,
                    eventType: EventType.RECORD_READ_DENIED,
                    metadata: {
                        reason: "Attempt to read patients records by unauthorized user",
                        timeStamp: new Date(Date.now()).toISOString()
                    }
                }
            })
            throw new ForbiddenException("Only active doctors and nurse of this clinic can read patients records")
        }

        const patients = await this.prisma.patient.findMany({
            where: { organizationId: organizationId },
            take: Math.min(limit ?? 20, 100),
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                organization: {
                    select: { name: true }
                },
                organizationId: true,
                userId: true,
                admittedAt: true,
                dischargeAt: true,
                createdAt: true,
                updatedAt: true
            }
        })

        if (!patients.length) {
            return [];
        }

        return patients;
    }
}
