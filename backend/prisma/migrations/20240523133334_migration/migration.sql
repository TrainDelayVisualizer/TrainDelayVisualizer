/*
  Warnings:

  - Added the required column `operator` to the `Line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Line" ADD COLUMN     "operator" TEXT NOT NULL;
