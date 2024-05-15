/*
  Warnings:

  - You are about to drop the `LineStatistic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LineStatistic" DROP CONSTRAINT "LineStatistic_name_fkey";

-- DropTable
DROP TABLE "LineStatistic";

-- CreateIndex
CREATE INDEX "TrainRide_plannedStart_idx" ON "TrainRide"("plannedStart");
