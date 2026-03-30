import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PatientService } from './patient.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PatientDto } from './dto/patient.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Role } from 'src/auth/dto/role.enum';
import { OrganizationGuard } from 'src/auth/guards/tenant.guard';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('add')
  @UseGuards(AuthGuard, OrganizationGuard, RoleGuard)
  @Roles(Role.Doctor)
  async addPatient(
    @Body() dto: PatientDto,
    @Req() req: any,
  ) {
    const {orgId, userId} = req.organizationContext
    return this.patientService.addNewPatient(dto, userId, orgId)
  }

  @Get('all')
  @UseGuards(AuthGuard, OrganizationGuard, RoleGuard)
  @Roles(Role.Doctor || Role.Nusre)
  async getPatients(
    @GetUser('sub') userId: string,
    @GetUser('activeOrg') activeOrg: any
  ) {
    return this.patientService.getAllPatientsInOrganization(userId, activeOrg.id)
  }


}



