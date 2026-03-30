import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { StorageService } from 'src/storage/storage.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/auth/dto/role.enum';
import { AttachmentDto } from './dto/AttachmentDto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { OrganizationGuard } from 'src/auth/guards/tenant.guard';

@Controller('attachment')
export class AttachmentController {
  constructor(
    private readonly attachmentService: AttachmentService,
  ) {}

  @UseGuards(AuthGuard, OrganizationGuard, RoleGuard)
  @Post('request-upload')
  @Roles(Role.Doctor) 
  async requestUpload(
    @Body() dto: AttachmentDto,
    @Req() req: any
  ) {
    const { orgId, userId } = req.organizationContext;
    console.log('User:', req.user);
    console.log('OrgContext:', req.organizationContext);
    return this.attachmentService.uploadRecords(dto, orgId, userId)
  }
}
