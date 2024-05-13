-- CreateTable
CREATE TABLE "LineStatistic" (
    "name" TEXT NOT NULL,
    "averageArrivalDelaySeconds" DOUBLE PRECISION NOT NULL,
    "averageDepartureDelaySeconds" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineStatistic_pkey" PRIMARY KEY ("name","date")
);

-- AddForeignKey
ALTER TABLE "LineStatistic" ADD CONSTRAINT "LineStatistic_name_fkey" FOREIGN KEY ("name") REFERENCES "Line"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
