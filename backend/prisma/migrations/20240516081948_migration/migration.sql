-- CreateIndex
CREATE INDEX "Section_plannedDeparture_stationFromId_stationToId_idx" ON "Section"("plannedDeparture" DESC, "stationFromId", "stationToId");
