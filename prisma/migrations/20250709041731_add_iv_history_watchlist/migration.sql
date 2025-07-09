-- CreateTable
CREATE TABLE "Watchlist" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT,
    "exchange" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'yahoo',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IvHistory" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "contractID" TEXT NOT NULL,
    "expiration" TEXT NOT NULL,
    "iv" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "watchlistId" INTEGER NOT NULL,

    CONSTRAINT "IvHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_symbol_key" ON "Watchlist"("symbol");

-- CreateIndex
CREATE INDEX "IvHistory_symbol_date_idx" ON "IvHistory"("symbol", "date");

-- AddForeignKey
ALTER TABLE "IvHistory" ADD CONSTRAINT "IvHistory_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
