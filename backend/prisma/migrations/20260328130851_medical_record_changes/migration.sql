/*
  Warnings:

  - You are about to drop the column `diagnosis` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `Country` on the `Organization` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[puid,organizationId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('SOAP', 'LAB_REPORT', 'SURGERY_SUMMARY', 'PEDIATRIC_VITAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'FILE_UPLOAD_REJECTED';
ALTER TYPE "EventType" ADD VALUE 'FILE_DOWNLOAD_REJECTED';
ALTER TYPE "EventType" ADD VALUE 'FILE_ACCESS_REJECTED';
ALTER TYPE "EventType" ADD VALUE 'RECORD_LOCKED';
ALTER TYPE "EventType" ADD VALUE 'RECORD_UNLOCKED';
ALTER TYPE "EventType" ADD VALUE 'RECORD_UPDATE_AUTHORIZED';
ALTER TYPE "EventType" ADD VALUE 'RECORD_UPDATE_UNAUTHORIZED';

-- DropIndex
DROP INDEX "Patient_puid_key";

-- AlterTable
ALTER TABLE "MedicalRecord" DROP COLUMN "diagnosis",
DROP COLUMN "notes",
ADD COLUMN     "content" JSONB NOT NULL,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockedById" TEXT,
ADD COLUMN     "signedAt" TIMESTAMP(3),
ADD COLUMN     "type" "RecordType" NOT NULL DEFAULT 'SOAP',
ADD COLUMN     "unlockedById" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "Country",
ADD COLUMN     "country" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_puid_organizationId_key" ON "Patient"("puid", "organizationId");
