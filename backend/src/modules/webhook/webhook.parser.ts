import { WebhookPayload, WebhookHeaders, ParserResult } from "../../common/types";

const MLBB_ID_REGEX = /\b(\d{6,8})\b/;
const NAH_KW = ["nambah", "tambah", "+1", "+2", "+3"];
const FAST_KW = ["fastrack", "fast", "cepat", "prioritas", "express"];

export function parseMessage(
  payload: WebhookPayload,
  regularPrice: number,
  fastrackPrice: number,
  bundlePrice: number
): ParserResult {
  const msg = (payload.message || "").toLowerCase().trim();
  const amount = payload.amount;

  const mlbbMatch = msg.match(MLBB_ID_REGEX);
  const isNambah = NAH_KW.some((kw) => msg.includes(kw));
  const isFastrack = FAST_KW.some((kw) => msg.includes(kw));

  if (mlbbMatch) {
    const idMlPlayer = mlbbMatch[1];
    const type = isFastrack ? "FASTRACK" : "NORMAL";
    const price = type === "FASTRACK" ? fastrackPrice : regularPrice;
    const matches = Math.max(1, Math.floor(amount / price));
    return { queue: true, type, matches, idMlPlayer, isNambah: false };
  }

  if (isNambah) {
    const price = isFastrack ? fastrackPrice : regularPrice;
    const type = isFastrack ? "FASTRACK" : "NORMAL";
    const matches = Math.max(1, Math.floor(amount / price));
    return { queue: true, type, matches, isNambah: true };
  }

  return { queue: false, type: null, matches: 0 };
}
