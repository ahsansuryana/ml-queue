import { Router, Request, Response } from "express";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../common/middleware/auth";
import { AuthRequest } from "../../common/types";

const router = Router();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const players = await prisma.player.findMany({
    where: { streamerId },
    orderBy: { createdAt: "desc" },
  });
  res.json(players);
});

router.patch("/:id", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const id = req.params.id as string;
  const { idMlPlayer, namaSociaBuzz, nama, role } = req.body;

  const player = await prisma.player.findFirst({
    where: { id, streamerId },
  });
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const updated = await prisma.player.update({
    where: { id },
    data: {
      idMlPlayer: idMlPlayer ?? undefined,
      namaSociaBuzz: namaSociaBuzz ?? undefined,
      role: role !== undefined ? role : undefined,
    },
  });
  res.json(updated);
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const id = req.params.id as string;

  const player = await prisma.player.findFirst({
    where: { id, streamerId },
  });
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  await prisma.player.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
