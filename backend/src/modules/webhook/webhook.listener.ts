import { Router, Request, Response } from "express";
import { prisma } from "../../config/database";
import { verifyToken } from "../../common/utils/hash";
import { WebhookPayload, ParserResult } from "../../common/types";
import { parseMessage } from "./webhook.parser";
import { getIO } from "../../config/socket";

const router = Router();

router.post("/sociabuzz/:randomId", async (req: Request, res: Response) => {
  const randomId = req.params.randomId as string;
  const token = req.headers["sb-webhook-token"] as string | undefined;

  const integration = await prisma.webhookIntegration.findUnique({
    where: { webhookUrl: randomId },
    include: { streamer: true as const },
  });

  if (!integration) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (integration.webhookTokenHash && token) {
    const valid = await verifyToken(token, integration.webhookTokenHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
  }

  const payload = req.body as WebhookPayload;
  const streamer = integration.streamer;

  const result: ParserResult = parseMessage(
    payload,
    streamer.regularPrice,
    streamer.fastrackPrice,
    streamer.bundlePrice
  );

  if (!result.queue) {
    await logPrediction(integration.streamerId, payload, result);
    res.json({ status: "support", message: "Pure support, skipped" });
    return;
  }

  const idMl = result.idMlPlayer || "";
  const viewerName = payload.supporter || "Unknown";
  const viewerEmail = payload.email_supporter || "";

  let player = result.idMlPlayer
    ? await prisma.player.findFirst({
        where: { streamerId: integration.streamerId, idMlPlayer: idMl },
      })
    : await prisma.player.findFirst({
        where: { streamerId: integration.streamerId, namaSociaBuzz: viewerName },
      });

  if (!player) {
    player = await prisma.player.create({
      data: {
        streamerId: integration.streamerId,
        idMlPlayer: idMl || viewerName,
        namaSociaBuzz: viewerName,
        emailSociaBuzz: viewerEmail,
      },
    });
  }

  const pricePerMatch =
    result.type === "FASTRACK"
      ? streamer.fastrackPrice
      : streamer.regularPrice;

  const totalMatches = result.matches;
  const bundleGroupId = totalMatches > 1 ? crypto.randomUUID() : null;

  const entries = [];
  for (let i = 0; i < totalMatches; i++) {
    const entry = await prisma.queueEntry.create({
      data: {
        streamerId: integration.streamerId,
        playerId: player.id,
        queueType: result.type || "NORMAL",
        bundleGroupId,
        transactionId: `${payload.id}-${i}`,
      },
      include: { player: true },
    });
    entries.push(entry);
  }

  await logPrediction(integration.streamerId, payload, result);

  getIO().to(`streamer:${integration.streamerId}`).emit("queue:update", {
    type: "new_entry",
    entries,
  });

  if (integration.isForwardEnabled && integration.forwardUrl) {
    fetch(integration.forwardUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ original_payload: payload, entries }),
    }).catch(() => {});
  }

  res.json({ status: "queued", entries });
});

async function logPrediction(
  streamerId: string,
  payload: WebhookPayload,
  result: ParserResult
) {
  await prisma.predictionLog.create({
    data: {
      streamerId,
      transactionId: payload.id,
      viewerName: payload.supporter || "Unknown",
      donationAmount: payload.amount,
      rawMessage: payload.message || "",
      predictedQueue: result.queue,
      predictedType: result.type as "NORMAL" | "FASTRACK" | null,
      predictedMatches: result.matches,
    },
  });
}

export default router;
