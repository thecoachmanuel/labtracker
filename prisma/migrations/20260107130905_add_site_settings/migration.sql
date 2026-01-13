/*
  Warnings:

  - You are about to drop the column `from_status` on the `SampleStatusLog` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `SampleStatusLog` table. All the data in the column will be lost.
  - You are about to drop the column `to_status` on the `SampleStatusLog` table. All the data in the column will be lost.
  - The primary key for the `SampleTest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assigned_user_id` on the `SampleTest` table. All the data in the column will be lost.
  - Added the required column `status` to the `SampleStatusLog` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `SampleTest` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `SampleTest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoUrl" TEXT,
    "logoTitle" TEXT NOT NULL DEFAULT 'LabTracker',
    "heroTitle" TEXT NOT NULL DEFAULT 'Precision Sample Tracking For Modern Labs',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Streamline your laboratory workflow with our secure, real-time sample management system.',
    "heroButtonText" TEXT NOT NULL DEFAULT 'Start Tracking Now',
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SampleStatusLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sample_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SampleStatusLog_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "Sample" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleStatusLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SampleStatusLog" ("id", "sample_id", "timestamp", "user_id") SELECT "id", "sample_id", "timestamp", "user_id" FROM "SampleStatusLog";
DROP TABLE "SampleStatusLog";
ALTER TABLE "new_SampleStatusLog" RENAME TO "SampleStatusLog";
CREATE TABLE "new_SampleTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sample_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "result" TEXT,
    "notes" TEXT,
    "assigned_to_id" TEXT,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SampleTest_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "Sample" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleTest_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Test" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleTest_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SampleTest" ("result", "sample_id", "test_id") SELECT "result", "sample_id", "test_id" FROM "SampleTest";
DROP TABLE "SampleTest";
ALTER TABLE "new_SampleTest" RENAME TO "SampleTest";
CREATE UNIQUE INDEX "SampleTest_sample_id_test_id_key" ON "SampleTest"("sample_id", "test_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
