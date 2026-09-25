/*
  Warnings:

  - You are about to drop the column `dateOfEvent` on the `Event` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `slotsLeft` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `registrationFee` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "dateOfEvent",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "slotsLeft" SET NOT NULL,
ALTER COLUMN "registrationFee" SET NOT NULL,
ALTER COLUMN "registrationFee" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Event_isArchived_startTime_idx" ON "Event"("isArchived", "startTime");

-- CreateIndex
CREATE INDEX "Registration_eventId_idx" ON "Registration"("eventId");
