-- CreateTable
CREATE TABLE "OptionSnapshot" (
    "id" BIGSERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "snapshotAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,

    CONSTRAINT "OptionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OptionSnapshot_symbol_snapshotAt_idx" ON "OptionSnapshot"("symbol", "snapshotAt");
