/*
  Warnings:

  - Added the required column `Country` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "Country" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;
