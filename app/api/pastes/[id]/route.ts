export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { notFoundJson, json } from "@/lib/validate";
import { getExpiryNowMs } from "@/lib/now";
import { FETCH_AND_DECR_LUA } from "@/lib/lua";

function normalizeEvalResult(raw: any): any[] | null {
  let res: any = raw;

  if (
    res &&
    typeof res === "object" &&
    !Array.isArray(res) &&
    "result" in res
  ) {
    res = (res as any).result;
  }

  if (Array.isArray(res) && Array.isArray(res[0])) {
    res = res[0];
  }

  return Array.isArray(res) ? res : null;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!id) return notFoundJson();

  const key = `paste:${id}`;
  const nowMs = getExpiryNowMs(req);

  const raw = await redis.eval(FETCH_AND_DECR_LUA, [key], [String(nowMs)]);
  const res = normalizeEvalResult(raw);

  if (!res || res[0] !== 1) return notFoundJson();

  const content = String(res[1] ?? "");
  const remainingStr = res[2] == null ? "" : String(res[2]);
  const expiresAtStr = res[3] == null ? "" : String(res[3]);

  const remaining_views = remainingStr ? Number(remainingStr) : null;
  const expires_at = expiresAtStr
    ? new Date(Number(expiresAtStr)).toISOString()
    : null;

  return json(200, { content, remaining_views, expires_at });
}
