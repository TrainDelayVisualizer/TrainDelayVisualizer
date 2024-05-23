-- CreateIndex
CREATE INDEX "Line_trainType_idx" ON "Line"("trainType");

-- CreateIndex
CREATE INDEX "TrainRide_plannedStart_plannedEnd_lineName_idx" ON "TrainRide"("plannedStart" DESC, "plannedEnd" DESC, "lineName");
