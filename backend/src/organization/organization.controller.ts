import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationDto } from './dto/organization.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { type Request } from 'express';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}
  
  @Post(':organizationId')
  @UseGuards(AuthGuard)
  async getOrg(
    @GetUser('organizationId') organizationId: string
  ) {
    return await this.organizationService.getOrganizationById(organizationId)
  }

}
