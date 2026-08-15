/*
  Warnings:

  - The values [SITE_ENGINEER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'STAFF', 'CLIENT');
ALTER TABLE "public"."user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE text USING ("role"::text);
UPDATE "user" SET "role" = 'STAFF' WHERE "role" = 'SITE_ENGINEER';
ALTER TABLE "user" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'STAFF';
COMMIT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'STAFF';
