-- AlterTable
ALTER TABLE "Sample" ADD COLUMN "age" TEXT;
ALTER TABLE "Sample" ADD COLUMN "clinical_info" TEXT;
ALTER TABLE "Sample" ADD COLUMN "gender" TEXT;
ALTER TABLE "Sample" ADD COLUMN "specimen_type" TEXT;

-- CreateTable
CREATE TABLE "Bench" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    CONSTRAINT "Bench_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserBench" (
    "user_id" TEXT NOT NULL,
    "bench_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "bench_id"),
    CONSTRAINT "UserBench_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserBench_bench_id_fkey" FOREIGN KEY ("bench_id") REFERENCES "Bench" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SampleTest" (
    "sample_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "result" TEXT,
    "assigned_user_id" TEXT,

    PRIMARY KEY ("sample_id", "test_id"),
    CONSTRAINT "SampleTest_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "Sample" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleTest_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Test" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleTest_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SampleTest" ("sample_id", "test_id") SELECT "sample_id", "test_id" FROM "SampleTest";
DROP TABLE "SampleTest";
ALTER TABLE "new_SampleTest" RENAME TO "SampleTest";
CREATE TABLE "new_Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "expected_tat_minutes" INTEGER NOT NULL,
    "unit_id" TEXT NOT NULL,
    "bench_id" TEXT,
    CONSTRAINT "Test_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Test_bench_id_fkey" FOREIGN KEY ("bench_id") REFERENCES "Bench" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("expected_tat_minutes", "id", "name", "unit_id") SELECT "expected_tat_minutes", "id", "name", "unit_id" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Bench_name_unit_id_key" ON "Bench"("name", "unit_id");
