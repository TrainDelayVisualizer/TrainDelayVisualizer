/*
  Warnings:

  - You are about to drop the column `plannedArravial` on the `Section` table. All the data in the column will be lost.
  - Added the required column `plannedArrival` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Section" DROP COLUMN "plannedArravial",
ADD COLUMN     "plannedArrival" TIMESTAMPTZ(3) NOT NULL;
