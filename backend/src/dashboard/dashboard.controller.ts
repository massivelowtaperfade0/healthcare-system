import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/auth/dto/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { OrganizationGuard } from 'src/auth/guards/tenant.guard';
import { ActiveOrganization } from 'src/common/decorators/tenant-context.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @UseGuards(AuthGuard, OrganizationGuard, RoleGuard)
  @Roles(Role.Admin)
  async getSummary(
    @GetUser('sub') userId: string,
    @ActiveOrganization() organization: any,
  ) {
    return this.dashboardService.faileLoginCount(userId, organization.orgId)
  }
}
