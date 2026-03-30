import { Body, Controller, Post, Res } from '@nestjs/common';
import { RegisterService } from './register.service';
import { SetUpOrganizationDto } from './dto/setup.dto';
import type { Response } from 'express';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('org')
  async createOrg(
    @Body() dto: SetUpOrganizationDto,
    @Res({ passthrough: true}) res: Response
  ) {
    const tokens = await this.registerService.setUpOrganization(dto);

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: false, // true in prod  
      sameSite: 'lax',
    })

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    })
  }
}
