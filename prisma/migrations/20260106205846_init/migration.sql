-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "unit_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "User_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "default_tat_minutes" INTEGER DEFAULT 60
);

-- CreateTable
CREATE TABLE "Ward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "expected_tat_minutes" INTEGER NOT NULL,
    "unit_id" TEXT,
    CONSTRAINT "Test_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lab_number" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "ward_id" TEXT,
    "unit_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COLLECTED',
    "collected_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Sample_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "Ward" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sample_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sample_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SampleTest" (
    "sample_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,

    PRIMARY KEY ("sample_id", "test_id"),
    CONSTRAINT "SampleTest_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "Sample" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleTest_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Test" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SampleStatusLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sample_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "SampleStatusLog_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "Sample" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleStatusLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_key" ON "Unit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ward_name_key" ON "Ward"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Sample_lab_number_key" ON "Sample"("lab_number");
