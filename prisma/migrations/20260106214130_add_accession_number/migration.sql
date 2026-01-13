/*
  Warnings:

  - Added the required column `accession_number` to the `Sample` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accession_number" TEXT NOT NULL,
    "lab_number" TEXT,
    "patient_name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "ward_id" TEXT,
    "unit_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COLLECTED',
    "collected_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT NOT NULL,
    "processed_by_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Sample_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "Ward" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sample_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sample_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sample_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sample" ("collected_at", "created_at", "created_by_id", "id", "lab_number", "patient_name", "source", "status", "unit_id", "updated_at", "ward_id") SELECT "collected_at", "created_at", "created_by_id", "id", "lab_number", "patient_name", "source", "status", "unit_id", "updated_at", "ward_id" FROM "Sample";
DROP TABLE "Sample";
ALTER TABLE "new_Sample" RENAME TO "Sample";
CREATE UNIQUE INDEX "Sample_accession_number_key" ON "Sample"("accession_number");
CREATE UNIQUE INDEX "Sample_lab_number_key" ON "Sample"("lab_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
