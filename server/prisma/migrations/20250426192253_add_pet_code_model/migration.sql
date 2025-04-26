/*
  Warnings:

  - You are about to drop the column `qr_code` on the `Pet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pet_code_id]` on the table `Pet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pet_code_id` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Pet_qr_code_key";

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "qr_code",
ADD COLUMN     "pet_code_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PetCode" (
    "id" TEXT NOT NULL,
    "activated_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pet_pet_code_id_key" ON "Pet"("pet_code_id");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_pet_code_id_fkey" FOREIGN KEY ("pet_code_id") REFERENCES "PetCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
