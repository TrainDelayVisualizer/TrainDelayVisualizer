-- CreateIndex
CREATE INDEX "TrainRide_plannedStart_idx" ON "TrainRide"("plannedStart" DESC);

-- CreateIndex
CREATE INDEX "TrainRide_plannedEnd_idx" ON "TrainRide"("plannedEnd" DESC);
