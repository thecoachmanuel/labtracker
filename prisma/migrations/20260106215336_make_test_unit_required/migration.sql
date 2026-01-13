/*
  Warnings:

  - Made the column `unit_id` on table `Test` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "expected_tat_minutes" INTEGER NOT NULL,
    "unit_id" TEXT NOT NULL,
    CONSTRAINT "Test_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("expected_tat_minutes", "id", "name", "unit_id") SELECT "expected_tat_minutes", "id", "name", "unit_id" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
