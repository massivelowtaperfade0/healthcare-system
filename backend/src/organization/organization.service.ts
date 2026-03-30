import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationService {
    constructor(
        private prisma: PrismaService
    ) {}

    // async createOrganization(dto: OrganizationDto) {
    //     const orgName = await this.prisma.organization.create({
    //         data: {
    //             name: dto.name
    //         },
    //         select: {
    //             id: true,
    //             name: true,
    //             createdAt: true,
    //             updatedAt: true,
    //         }
    //     })

    //     if (!orgName) {
    //         return ('Something went wrong')
    //     }

    //     return orgName
    // }

    async getOrganizationById(organizationId: string) {
        const organization = await this.prisma.organization.findUnique({
            where: {
                id: organizationId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        })

        if (!organization) {
            throw new NotFoundException("Organization not found");
        }

        return organization;
    }
}
