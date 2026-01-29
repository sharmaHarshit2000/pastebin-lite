import type { NextRequest } from "next/server";

export function getExpiryNowMsFromHeaders(h: Headers): number {
  const realNow = Date.now();
  if (process.env.TEST_MODE !== "1") return realNow;

  const v = h.get("x-test-now-ms");
  if (!v) return realNow;

  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return realNow;
  return n;
}

export function getExpiryNowMs(req: NextRequest): number {
  return getExpiryNowMsFromHeaders(req.headers);
}
