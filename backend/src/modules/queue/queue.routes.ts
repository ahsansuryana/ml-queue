import { Router, Request, Response } from "express";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../common/middleware/auth";
import { AuthRequest } from "../../common/types";
import { getIO } from "../../config/socket";

const router = Router();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;

  const queue = await prisma.queueEntry.findMany({
    where: { streamerId, done: false },
    include: { player: true },
    orderBy: [
      { queueType: "asc" },
      { timestamp: "asc" },
    ],
  });

  const grouped = new Map<string, (typeof queue)[0]>();
  for (const entry of queue) {
    if (!grouped.has(entry.playerId)) {
      grouped.set(entry.playerId, entry);
    }
  }

  const distinct = Array.from(grouped.values());
  const top4 = distinct.slice(0, 4);
  const rest = distinct.slice(4);

  res.json({
    batch: top4,
    queue: rest,
    total: distinct.length,
  });
});

router.post("/skip/:id", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const id = req.params.id as string;

  const entry = await prisma.queueEntry.findFirst({
    where: { id, streamerId, done: false },
  });

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  getIO().to(`streamer:${streamerId}`).emit("queue:update", {
    type: "skipped",
    playerId: entry.playerId,
  });

  res.json({ ok: true });
});

router.post("/pull/:id", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const id = req.params.id as string;

  const entry = await prisma.queueEntry.findFirst({
    where: { id, streamerId, done: false },
  });

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  await prisma.queueEntry.update({
    where: { id },
    data: { timestamp: new Date() },
  });

  getIO().to(`streamer:${streamerId}`).emit("queue:update", {
    type: "pulled",
    playerId: entry.playerId,
  });

  res.json({ ok: true });
});

router.post("/confirm", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const { playerIds } = req.body as { playerIds: string[] };

  if (!playerIds || playerIds.length !== 4) {
    res.status(400).json({ error: "Need exactly 4 player IDs" });
    return;
  }

  const now = new Date();

  for (const playerId of playerIds) {
    const oldest = await prisma.queueEntry.findFirst({
      where: { streamerId, playerId, done: false },
      orderBy: { timestamp: "asc" },
    });
    if (oldest) {
      await prisma.queueEntry.update({
        where: { id: oldest.id },
        data: { done: true },
      });
    }
  }

  getIO().to(`streamer:${streamerId}`).emit("queue:update", {
    type: "confirmed",
    playerIds,
    timestamp: now,
  });

  res.json({ ok: true, confirmed: playerIds });
});

router.get("/pricing", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const streamer = await prisma.streamer.findUnique({
    where: { id: streamerId },
    select: {
      regularPrice: true,
      bundlePrice: true,
      bundleMatchCount: true,
      fastrackPrice: true,
    },
  });
  res.json(streamer);
});

router.put("/pricing", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const { regularPrice, bundlePrice, bundleMatchCount, fastrackPrice } = req.body;

  await prisma.streamer.update({
    where: { id: streamerId },
    data: {
      regularPrice: regularPrice ?? undefined,
      bundlePrice: bundlePrice ?? undefined,
      bundleMatchCount: bundleMatchCount ?? undefined,
      fastrackPrice: fastrackPrice ?? undefined,
    },
  });

  res.json({ ok: true });
});

export default router;
