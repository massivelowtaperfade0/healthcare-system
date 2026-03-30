/*
  Warnings:

  - The values [LOGIN_SUCCESS,LOGIN_FAILED,SUSPICIOUS_ACTIVITY] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.
  - The `metadata` column on the `ActivityLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isActive` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `reasonForDeactivation` on the `Membership` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_LEAVE', 'TERMINATED');

-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('AUTH_LOGIN_SUCCESS', 'AUTH_LOGIN_FAILED', 'AUTH_LOGOUT', 'AUTH_SESSION_REVOKED', 'AUTH_PASSWORD_CHANGED', 'ADMIN_PASSWORD_CHANGED', 'ATTEMPTED_PASSWORD_CHANGE', 'NEW_ORGANIZATION_CREATED', 'NEW_ADMIN_CREATED', 'PATIENT_RECORD_CREATED', 'PATIENT_RECORD_UPDATED', 'PATIENT_RECORD_LINKED', 'MEMBER_CREATED', 'MEMBER_STATUS_UPDATE', 'PE_VIOLATION_HORIZONTAL', 'PE_VIOLATION_VERTICAL', 'SECURITY_IP_BANNED', 'SECURITY_ANOMALY_DETECTED', 'SECURITY_RATE_LIMIT_HIT', 'RECORD_READ_AUTHORIZED', 'RECORD_READ_DENIED', 'RECORD_WRITE_AUTHORIZED', 'RECORD_WRITE_DENIED', 'RECORD_EXPORTED');
ALTER TABLE "ActivityLog" ALTER COLUMN "eventType" TYPE "EventType_new" USING ("eventType"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "public"."EventType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_organizationId_fkey";

-- DropIndex
DROP INDEX "Membership_organizationId_role_isActive_idx";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB,
ALTER COLUMN "organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "isActive",
DROP COLUMN "reasonForDeactivation",
ADD COLUMN     "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastStatusChanged" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "statusChangeReason" TEXT,
ADD COLUMN     "statusChangedById" TEXT;

-- CreateIndex
CREATE INDEX "ActivityLog_organizationId_eventType_idx" ON "ActivityLog"("organizationId", "eventType");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Membership_status_idx" ON "Membership"("status");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
