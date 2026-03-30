import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
  ) {
    return this.userService.getMe(userId);
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
    @Req() req,
  ) {
    const { organizationId } = req.organizationContext
    return this.userService.activityLog(organizationId);
  }
}
