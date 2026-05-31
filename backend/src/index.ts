import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { env } from "./config/env";
import { prisma } from "./config/database";
import { connectRedis } from "./config/redis";
import { initSocket } from "./config/socket";

import authRoutes from "./modules/auth/auth.routes";
import webhookRoutes from "./modules/webhook/webhook.routes";
import webhookListener from "./modules/webhook/webhook.listener";
import queueRoutes from "./modules/queue/queue.routes";
import playerRoutes from "./modules/player/player.routes";
import predictionRoutes from "./modules/prediction/prediction.routes";

const app = express();
const server = http.createServer(app);

app.use(
  cors({ origin: env.FRONTEND_URL, credentials: true })
);
app.use(helmet());
app.use(express.json());
app.use(passport.initialize());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests" },
});
app.use("/api/webhooks", limiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/integrations", webhookRoutes);
app.use("/api/webhooks", webhookListener);
app.use("/api/queue", queueRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/predictions", predictionRoutes);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

async function start() {
  try {
    await prisma.$connect();
    console.log("Database connected");

    await connectRedis();
    console.log("Redis connected");

    initSocket(server);

    server.listen(env.PORT, () => {
      console.log(`SAS Backend running on port ${env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

start();

export default app;
