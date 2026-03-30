import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RecordService } from './record.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { OrganizationGuard } from 'src/auth/guards/tenant.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/auth/dto/role.enum';
import { RecordDto } from './dto/RecordDto';

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post('add')
  @UseGuards(AuthGuard, OrganizationGuard, RoleGuard)
  @Roles(Role.Doctor)
  async addMedicalRecord(
    @Body() dto: RecordDto,
    @Req() req: any
  ) {

    const { orgId, userId } = req.organizationContext;
    return this.recordService.addMedicalRecord(dto, userId, orgId)
  }
}
