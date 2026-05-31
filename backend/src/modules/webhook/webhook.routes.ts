import { Router, Request, Response } from "express";
import { nanoid } from "nanoid";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../common/middleware/auth";
import { AuthRequest } from "../../common/types";
import { hashToken } from "../../common/utils/hash";

const router = Router();

router.get("/webhook", authMiddleware, async (req: Request, res: Response) => {
  const streamerId = (req as AuthRequest).streamerId!;
  let integration = await prisma.webhookIntegration.findUnique({
    where: { streamerId },
  });
  if (!integration) {
    integration = await prisma.webhookIntegration.create({
      data: {
        streamerId,
        webhookUrl: nanoid(16),
      },
    });
  }
  res.json(integration);
});

router.post(
  "/webhook/regenerate",
  authMiddleware,
  async (req: Request, res: Response) => {
    const streamerId = (req as AuthRequest).streamerId!;
    const integration = await prisma.webhookIntegration.upsert({
      where: { streamerId },
      update: { webhookUrl: nanoid(16) },
      create: { streamerId, webhookUrl: nanoid(16) },
    });
    res.json(integration);
  }
);

router.post(
  "/webhook/secret",
  authMiddleware,
  async (req: Request, res: Response) => {
    const streamerId = (req as AuthRequest).streamerId!;
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Token required" });
      return;
    }
    const hashed = await hashToken(token);
    await prisma.webhookIntegration.upsert({
      where: { streamerId },
      update: { webhookTokenHash: hashed },
      create: { streamerId, webhookUrl: nanoid(16), webhookTokenHash: hashed },
    });
    res.json({ ok: true });
  }
);

router.get("/forward", authMiddleware, async (req: Request, res: Response) => {
  const streamerId = (req as AuthRequest).streamerId!;
  const integration = await prisma.webhookIntegration.findUnique({
    where: { streamerId },
  });
  res.json({
    isForwardEnabled: integration?.isForwardEnabled ?? false,
    forwardUrl: integration?.forwardUrl ?? null,
  });
});

router.put(
  "/forward",
  authMiddleware,
  async (req: Request, res: Response) => {
    const streamerId = (req as AuthRequest).streamerId!;
    const { isForwardEnabled, forwardUrl } = req.body;
    await prisma.webhookIntegration.upsert({
      where: { streamerId },
      update: { isForwardEnabled: !!isForwardEnabled, forwardUrl },
      create: {
        streamerId,
        webhookUrl: nanoid(16),
        isForwardEnabled: !!isForwardEnabled,
        forwardUrl,
      },
    });
    res.json({ ok: true });
  }
);

export default router;
