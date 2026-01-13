-- CreateTable
CREATE TABLE "Role" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "UserRole" (
    "user_id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "role_name"),
    CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserRole_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "Role" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
