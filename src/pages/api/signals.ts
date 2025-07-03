import { SignalRepository } from "@/modules/signals/signals.repository";
import { SignalService } from "@/modules/signals/signals.services";
import type { NextApiRequest, NextApiResponse } from "next";

const service = new SignalService(new SignalRepository());

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    if(method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    const { limit, symbol } = req.query;
    const limitNum = typeof limit === "string" ? parseInt(limit) : 20;
    const symbolStr = typeof symbol === "string" ? symbol : undefined;

    const signals = await service.getRecentSignals(limitNum, symbolStr);
    return res.status(200).json(signals);
}