-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "plannedDeparture" DROP NOT NULL,
ALTER COLUMN "actualDeparture" DROP NOT NULL,
ALTER COLUMN "actualArrival" DROP NOT NULL,
ALTER COLUMN "plannedArrival" DROP NOT NULL;
