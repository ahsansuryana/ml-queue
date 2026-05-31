import { Request } from "express";

export interface AuthRequest extends Request {
  streamerId?: string;
}

export interface WebhookPayload {
  id: string;
  amount: number;
  currency?: string;
  supporter?: string;
  email_supporter?: string;
  message?: string;
  item?: { name?: string; qty?: number };
  level?: { title?: string; price?: number };
  created_at?: string;
}

export interface WebhookHeaders {
  "sb-webhook-token"?: string;
}

export interface ParserResult {
  queue: boolean;
  type: "NORMAL" | "FASTRACK" | null;
  matches: number;
  idMlPlayer?: string;
  isNambah?: boolean;
}

export interface GroupCandidate {
  playerId: string;
  idMlPlayer: string;
  namaSociaBuzz: string;
  queueType: "NORMAL" | "FASTRACK";
  timestamp: Date;
  remainingTickets: number;
}
