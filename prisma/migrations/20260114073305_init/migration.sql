-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "unit_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "default_tat_minutes" INTEGER DEFAULT 60,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bench" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,

    CONSTRAINT "Bench_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBench" (
    "user_id" TEXT NOT NULL,
    "bench_id" TEXT NOT NULL,

    CONSTRAINT "UserBench_pkey" PRIMARY KEY ("user_id","bench_id")
);

-- CreateTable
CREATE TABLE "Ward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expected_tat_minutes" INTEGER NOT NULL,
    "unit_id" TEXT NOT NULL,
    "bench_id" TEXT,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL,
    "accession_number" TEXT NOT NULL,
    "lab_number" TEXT,
    "patient_name" TEXT NOT NULL,
    "age" TEXT,
    "gender" TEXT,
    "clinical_info" TEXT,
    "specimen_type" TEXT,
    "source" TEXT NOT NULL,
    "ward_id" TEXT,
    "unit_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COLLECTED',
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT NOT NULL,
    "processed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleTest" (
    "id" TEXT NOT NULL,
    "sample_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "result" TEXT,
    "notes" TEXT,
    "assigned_to_id" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SampleTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleStatusLog" (
    "id" TEXT NOT NULL,
    "sample_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SampleStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "logoTitle" TEXT NOT NULL DEFAULT 'LabTracker',
    "heroTitle" TEXT NOT NULL DEFAULT 'Precision Sample Tracking For Modern Labs',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Streamline your laboratory workflow with our secure, real-time sample management system.',
    "heroButtonText" TEXT NOT NULL DEFAULT 'Start Tracking Now',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_key" ON "Unit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Bench_name_unit_id_key" ON "Bench"("name", "unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "Ward_name_key" ON "Ward"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Sample_accession_number_key" ON "Sample"("accession_number");

-- CreateIndex
CREATE UNIQUE INDEX "Sample_lab_number_key" ON "Sample"("lab_number");

-- CreateIndex
CREATE UNIQUE INDEX "SampleTest_sample_id_test_id_key" ON "SampleTest"("sample_id", "test_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bench" ADD CONSTRAINT "Bench_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBench" ADD CONSTRAINT "UserBench_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBench" ADD CONSTRAINT "UserBench_bench_id_fkey" FOREIGN KEY ("bench_id") REFERENCES "Bench"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_bench_id_fkey" FOREIGN KEY ("bench_id") REFERENCES "Bench"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "Ward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleTest" ADD CONSTRAINT "SampleTest_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleTest" ADD CONSTRAINT "SampleTest_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleTest" ADD CONSTRAINT "SampleTest_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleStatusLog" ADD CONSTRAINT "SampleStatusLog_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleStatusLog" ADD CONSTRAINT "SampleStatusLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
