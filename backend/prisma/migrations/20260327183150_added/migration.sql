/*
  Warnings:

  - You are about to drop the column `createdById` on the `MedicalRecord` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[puid]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,organizationId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staffProfileId` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `puid` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'NEW_FILE_UPLOADED';
ALTER TYPE "EventType" ADD VALUE 'FILE_DOWNLOADED';
ALTER TYPE "EventType" ADD VALUE 'FILE_ACCESSED';

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_createdById_fkey";

-- DropIndex
DROP INDEX "Patient_userId_key";

-- AlterTable
ALTER TABLE "MedicalRecord" DROP COLUMN "createdById",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "staffProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "isExclusive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "puid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "lastAccessedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isGlobalStaff" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StaffProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "specialty" TEXT,
    "bio" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "hash" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_userId_key" ON "StaffProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_licenseNumber_key" ON "StaffProfile"("licenseNumber");

-- CreateIndex
CREATE INDEX "Attachment_recordId_idx" ON "Attachment"("recordId");

-- CreateIndex
CREATE INDEX "Attachment_organizationId_idx" ON "Attachment"("organizationId");

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_idx" ON "MedicalRecord"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_puid_key" ON "Patient"("puid");

-- CreateIndex
CREATE INDEX "Patient_puid_idx" ON "Patient"("puid");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_organizationId_key" ON "Patient"("userId", "organizationId");

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_staffProfileId_fkey" FOREIGN KEY ("staffProfileId") REFERENCES "StaffProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "StaffProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
