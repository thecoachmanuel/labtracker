/*
  Warnings:

  - You are about to drop the column `status` on the `SampleStatusLog` table. All the data in the column will be lost.
  - Added the required column `to_status` to the `SampleStatusLog` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SampleStatusLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sample_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notes" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SampleStatusLog_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "Sample" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleStatusLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SampleStatusLog" ("id", "sample_id", "timestamp", "user_id") SELECT "id", "sample_id", "timestamp", "user_id" FROM "SampleStatusLog";
DROP TABLE "SampleStatusLog";
ALTER TABLE "new_SampleStatusLog" RENAME TO "SampleStatusLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
