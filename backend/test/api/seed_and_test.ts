import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '/generated/prisma/client';
import { UserRole, MembershipStatus } from 'src/generated/prisma/enums';

const prisma = new PrismaClient(
    {adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })}
);

async function main() {
  // 1. Create the Organization
  const org = await prisma.organization.upsert({
    where: { name: 'City Hospital' },
    update: {},
    create: { 
        name: 'City Hospital', 
        city: 'Mumbai',
        state: 'Maharashtra',
        Country: 'India'
    },
  });

  // 2. Create the Doctor (User + StaffProfile + Membership)
  const doctorUser = await prisma.user.upsert({
    where: { email: 'john@user.com' },
    update: {},
    create: {
      id: 'e779f1c1-7e75-4cc0-853f-956ba4eede8c', // Match your JWT sub
      email: 'john@user.com',
      firstName: 'john',
      lastName: 'doe',
      hash: 'hashed_password_here',
    },
  });

  const staff = await prisma.staffProfile.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      licenseNumber: 'DOC-12345',
      isVerified: true,
    },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: doctorUser.id, organizationId: org.id } },
    update: {},
    create: {
      userId: doctorUser.id,
      organizationId: org.id,
      role: UserRole.DOCTOR,
      status: MembershipStatus.ACTIVE,
    },
  });

  // 3. Create a Patient & Medical Record
  const patient = await prisma.patient.create({
    data: {
      puid: 'CIT-1234-5678',
      dateOfBirth: new Date(),
      admittedAt: new Date(),
      firstName: 'Test',
      lastName: 'Patient',
      organizationId: org.id,
    },
  });

  const record = await prisma.medicalRecord.create({
    data: {
      patientId: patient.id,
      organizationId: org.id,
      diagnosis: 'something',
      notes: 'also something',
      staffProfileId: '1c24398b-0f45-4aa8-98ab-64c40a4e86fa'
    },
  });

  console.log({
    message: "Seed successful! Use these IDs in Postman:",
    orgId: org.id,
    patientId: patient.id,
    recordId: record.id
  });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());