/* eslint-disable no-console */
// This script fetches historical IV from Alpha Vantage for all symbols in the watchlist
// and stores them into the iv_history table (assumes a Prisma-based project with PostgreSQL)

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { subDays, formatISO, parseISO, isBefore } from 'date-fns';

interface IvHistoryEntry {
  contractID: string;
  symbol: string;
  expiration: string;
  iv: number;
  date: Date;
}

const prisma = new PrismaClient();
const ALPHA_API_KEY = process.env.ALPHAV_API_KEY!;
const BASE_URL = 'https://www.alphavantage.co/query';

async function fetchIvHistory(symbol: string) {
  const url = `${BASE_URL}?function=HISTORICAL_OPTIONS&symbol=${symbol}&apikey=${ALPHA_API_KEY}`;
  const res = await axios.get(url);
  return res.data.data || [];
}

async function main() {
  const watchlist = await prisma.watchlist.findMany();
  for (const stock of watchlist) {
    const symbol = stock.symbol;
    console.log(`\nProcessing ${symbol}`);

    // get latest entry
    const latestEntry = await prisma.ivHistory.findFirst({
      where: { symbol },
      orderBy: { date: 'desc' },
    });

    const lastDate = latestEntry ? parseISO(formatISO(latestEntry.date)) : null;
    const todayMinus1 = subDays(new Date(), 1); // AV provides up to previous day

    const ivData = await fetchIvHistory(symbol);
    const filtered = ivData
      .map((entry: any) => ({
        contractID: entry.contractID,
        symbol: entry.symbol,
        expiration: entry.expiration,
        iv: parseFloat(entry.implied_volatility),
        date: parseISO(entry.date),
      }))
      .filter((entry: any) =>
        !lastDate || (isBefore(lastDate, entry.date) && isBefore(entry.date, todayMinus1))
      );

    if (filtered.length === 0) {
      console.log(`No new IV data for ${symbol}`);
      continue;
    }

    await prisma.ivHistory.createMany({
      data: filtered.map((entry: IvHistoryEntry) => ({
        contractID: entry.contractID,
        symbol: entry.symbol,
        expiration: entry.expiration,
        iv: entry.iv,
        date: entry.date,
      })),
      skipDuplicates: true,
    });

    console.log(`Inserted ${filtered.length} IV records for ${symbol}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
