import { Body, Controller, Delete, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { LoginDto } from './dto/login.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from './dto/role.enum';
import { RoleGuard } from './guards/role.guard';
import { AuthGuard } from './guards/auth.guard';
import type { Request, Response } from 'express';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ActiveOrganization } from 'src/common/decorators/tenant-context.decorator';
import { OrganizationGuard } from './guards/tenant.guard';
import { CreateClaimDto, VerifyClaimDto } from './dto/patient-validation';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // add throttler later

  @Post('signup')
  async createAccount(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.userSignUp(dto);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken)

    // res.cookie('access_token', tokens.accessToken, {
    //   httpOnly: true,
    //   secure: false, //true in prod
    //   sameSite: 'lax'
    // })

    // res.cookie('refresh_token', tokens.refreshToken, {
    //   httpOnly: true,
    //   secure: false, //true in prod
    //   sameSite: 'lax'
    // })

    return {message: 'Account created successfully'}
  }

  @Post('staff')
  @UseGuards(AuthGuard, OrganizationGuard, RoleGuard)
  @Roles(Role.Admin)
  async createStaff(
    @Body() dto: CreateStaffDto,
    @ActiveOrganization() organization: any,
  ) {
    console.log(organization);
    return this.authService.staffSignUp(dto, organization.userId, organization.orgId);
  }

// auth.controller.ts
  @Post('login')
  async login(
    @Body() dto: LoginDto, 
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto);

    this.setCookies(res, accessToken, refreshToken)

    return { 
      message: 'Logged in',
      user: user,
     };
  }

  @UseGuards(AuthGuard)
  @Delete('logout')
  async logout(
    @GetUser() user: any,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.logout(user.sub, user.jti );

    res.clearCookie('access_token')
    res.clearCookie('refresh_token')

    return { message: "Logged out successfully"};
  }

  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const oldRefreshToken = req.cookies?.['refresh_token'];

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const newTokens = await this.authService.validateRefreshTokens(oldRefreshToken);

    this.setCookies(res, newTokens.accessToken, newTokens.refreshToken);

    return {message: "Token refreshed"};
  }

  @Post('create-claim')
  @UseGuards(AuthGuard)
  async createClaim(
    @Body() dto: CreateClaimDto,
    @GetUser() user: any,
  ) {
    return this.authService.generatePatientClaim(dto, user.sub);
  }

  @Post('verify-claim')
  @UseGuards(AuthGuard)
  async verifyClaim(
    @Body() dto: VerifyClaimDto,
    @GetUser() user: any,
  ) {
    return this.authService.validatePatientClaim(dto, user.sub);
  }

  private setCookies(res: Response, access: string, refresh: string) {
    const isProd = process.env.NODE_ENV === 'production';
    const commonOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/'
    }

    res.cookie('access_token', access, commonOptions);
    res.cookie('refresh_token', refresh, commonOptions);
  }

}
