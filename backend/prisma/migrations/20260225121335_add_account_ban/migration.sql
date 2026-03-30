/*
  Warnings:

  - You are about to drop the column `userId` on the `MedicalRecord` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,organizationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_userId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MedicalRecord" DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lockUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "MedicalRecord_organizationId_idx" ON "MedicalRecord"("organizationId");

-- CreateIndex
CREATE INDEX "Patient_organizationId_idx" ON "Patient"("organizationId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_organizationId_role_idx" ON "User"("organizationId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_organizationId_key" ON "User"("email", "organizationId");

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
