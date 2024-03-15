-- CreateTable
CREATE TABLE "TrainStation" (
    "id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionShort" TEXT NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TrainStation_pkey" PRIMARY KEY ("id")
);
