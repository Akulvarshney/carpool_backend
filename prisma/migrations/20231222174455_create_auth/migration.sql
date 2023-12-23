-- CreateTable
CREATE TABLE "auth" (
    "authentication_id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_pkey" PRIMARY KEY ("authentication_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_emailId_key" ON "auth"("emailId");
