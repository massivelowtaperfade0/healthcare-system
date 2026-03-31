import { Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/auth/dto/role.enum';
import { OrganizationGuard } from 'src/auth/guards/tenant.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getMe(
    @GetUser('sub') userId: string,
    @Headers('x-org-id') orgId?: string,
  ) {
    return this.userService.getMe(userId, orgId);
  }

  @UseGuards(AuthGuard, RoleGuard, OrganizationGuard)
  @Roles(Role.Admin)
  @Get('activity')
  async getActivity(
    @Req() req,
  ) {
    const { organizationId } = req.organizationContext;

    return this.userService.activityLog(organizationId);
  }

  @UseGuards(AuthGuard, RoleGuard, OrganizationGuard)
  @Roles(Role.Admin)
  @Get('activity/failed')
  async getFailedCount(
    @Req() req: any,
  ) {
    const { organizationId } = req.organizationContext
    return this.userService.activityLog(organizationId);
  }

  @Get('staff')
  @UseGuards(AuthGuard, OrganizationGuard, RoleGuard)
  @Roles(Role.Admin)
  async getActiveStaff(
    @Req() req: any
  ) {
    const { orgId } = req.organizationContext;

    return this.userService.getAllStaff(orgId);
  }
}
