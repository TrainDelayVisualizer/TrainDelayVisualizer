-- CreateTable
CREATE TABLE "Line" (
    "name" TEXT NOT NULL,
    "trainType" TEXT NOT NULL,

    CONSTRAINT "Line_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "TrainRide" (
    "id" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stationStartId" INTEGER NOT NULL,
    "stationEndId" INTEGER NOT NULL,
    "plannedStart" TIMESTAMPTZ(3) NOT NULL,
    "plannedEnd" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "TrainRide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "stationFromId" INTEGER NOT NULL,
    "stationToId" INTEGER NOT NULL,
    "plannedDeparture" TIMESTAMPTZ(3) NOT NULL,
    "actualDeparture" TIMESTAMPTZ(3) NOT NULL,
    "plannedArravial" TIMESTAMPTZ(3) NOT NULL,
    "actualArrival" TIMESTAMPTZ(3) NOT NULL,
    "isDelay" BOOLEAN NOT NULL,
    "isCancelled" BOOLEAN NOT NULL,
    "trainRideId" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("trainRideId","stationFromId","stationToId")
);

-- AddForeignKey
ALTER TABLE "TrainRide" ADD CONSTRAINT "TrainRide_lineName_fkey" FOREIGN KEY ("lineName") REFERENCES "Line"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainRide" ADD CONSTRAINT "TrainRide_stationStartId_fkey" FOREIGN KEY ("stationStartId") REFERENCES "TrainStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainRide" ADD CONSTRAINT "TrainRide_stationEndId_fkey" FOREIGN KEY ("stationEndId") REFERENCES "TrainStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_stationFromId_fkey" FOREIGN KEY ("stationFromId") REFERENCES "TrainStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_stationToId_fkey" FOREIGN KEY ("stationToId") REFERENCES "TrainStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_trainRideId_fkey" FOREIGN KEY ("trainRideId") REFERENCES "TrainRide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
