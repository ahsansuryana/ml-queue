import { Router, Request, Response } from "express";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../common/middleware/auth";
import { AuthRequest } from "../../common/types";

const router = Router();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string | undefined;

  const where: any = { streamerId };
  if (status) where.status = status as any;

  const [logs, total] = await Promise.all([
    prisma.predictionLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.predictionLog.count({ where }),
  ]);

  res.json({ logs, total, page, limit });
});

router.patch("/:id", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const id = req.params.id as string;
  const { correctedQueue, correctedType, correctedMatches } = req.body;

  const log = await prisma.predictionLog.findFirst({
    where: { id, streamerId },
  });
  if (!log) {
    res.status(404).json({ error: "Log not found" });
    return;
  }

  const updated = await prisma.predictionLog.update({
    where: { id },
    data: {
      correctedQueue: correctedQueue !== undefined ? correctedQueue : undefined,
      correctedType: correctedType !== undefined ? correctedType : undefined,
      correctedMatches:
        correctedMatches !== undefined ? correctedMatches : undefined,
      status: "MANUAL_FIXED",
    },
  });
  res.json(updated);
});

router.get("/export", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;

  const logs = await prisma.predictionLog.findMany({
    where: { streamerId, status: "MANUAL_FIXED" },
  });

  const jsonl = logs
    .map((log) =>
      JSON.stringify({
        message: log.rawMessage,
        queue:
          log.correctedQueue !== null ? log.correctedQueue : log.predictedQueue,
        type:
          log.correctedType !== null ? log.correctedType : log.predictedType,
        matches:
          log.correctedMatches !== null
            ? log.correctedMatches
            : log.predictedMatches,
      })
    )
    .join("\n");

  res.setHeader("content-type", "application/jsonl");
  res.setHeader(
    "content-disposition",
    `attachment; filename="training-data-${Date.now()}.jsonl"`
  );
  res.send(jsonl);
});

router.get("/stats", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;

  const [total, fixed] = await Promise.all([
    prisma.predictionLog.count({ where: { streamerId } }),
    prisma.predictionLog.count({
      where: { streamerId, status: "MANUAL_FIXED" },
    }),
  ]);

  const accuracy = total > 0 ? ((total - fixed) / total) * 100 : 100;

  res.json({ total, corrected: fixed, accuracy: Math.round(accuracy) });
});

export default router;
