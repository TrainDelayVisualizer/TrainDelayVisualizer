-- AlterTable
ALTER TABLE "Line" ADD COLUMN     "operator" TEXT NOT NULL DEFAULT 'unknown';

-- CreateIndex
CREATE INDEX "Line_operator_idx" ON "Line"("operator");
