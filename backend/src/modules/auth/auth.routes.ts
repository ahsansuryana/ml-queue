import { Router, Request, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../common/middleware/auth";
import { AuthRequest } from "../../common/types";

const router = Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.FRONTEND_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email"));

        let streamer = await prisma.streamer.findUnique({
          where: { googleId: profile.id },
        });

        if (!streamer) {
          streamer = await prisma.streamer.create({
            data: {
              googleId: profile.id,
              email,
              displayName: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
            },
          });
        }

        done(null, streamer);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: Request, res: Response) => {
    const streamer = req.user as { id: string };
    const token = jwt.sign({ streamerId: streamer.id }, env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

router.post("/logout", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const { streamerId } = req as AuthRequest;
  const streamer = await prisma.streamer.findUnique({
    where: { id: streamerId },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      regularPrice: true,
      bundlePrice: true,
      bundleMatchCount: true,
      fastrackPrice: true,
      webhook: {
        select: {
          webhookUrl: true,
          isForwardEnabled: true,
          forwardUrl: true,
        },
      },
    },
  });
  res.json(streamer);
});

export default router;
