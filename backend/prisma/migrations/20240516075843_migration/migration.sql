-- DropIndex
DROP INDEX "TrainRide_plannedStart_idx";

-- CreateIndex
CREATE INDEX "TrainRide_plannedStart_plannedEnd_idx" ON "TrainRide"("plannedStart" DESC, "plannedEnd" DESC);
