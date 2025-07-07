import getFullSnapshot from "@/application/use-case/getFullSnapshot";
import { prisma } from "@/infrastructure/db/prisma-orm";
import AlpacaRepository from "@/infrastructure/repository/alpaca.repository";
import { NextApiRequest, NextApiResponse } from "next";

/** TTL in ms (default 15 min) */
const TTL = (Number(process.env.CHAIN_SNAPSHOT_TTL_MIN) || 15) * 60_000;
const repo = new AlpacaRepository();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { symbol } = req.query;

  if (typeof symbol !== "string" || !symbol) {
    return res.status(400).json({ error: "Missing or invalid 'symbol' parameter" });
  }

  // 1️⃣ try recent cache
  const cached = await prisma.optionSnapshot.findFirst({
    where: { symbol, snapshotAt: { gte: new Date(Date.now() - TTL) } },
    orderBy: { snapshotAt: "desc" },
  });
  if (cached) return res.json(cached.data);

    // 2️⃣ fetch from Alpaca
  const rows = await getFullSnapshot(symbol, repo);

  // 3️⃣ persist
  await prisma.optionSnapshot.create({
    data: {
      symbol,
      data: JSON.parse(JSON.stringify(rows)),
      snapshotAt: new Date(),
    },
  });

  return res.json(rows);
}

