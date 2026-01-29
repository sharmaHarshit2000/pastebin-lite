
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { redis } from "@/lib/redis";
import { badRequest, json, isIntGe1 } from "@/lib/validate";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const content = body?.content;
  const ttl = body?.ttl_seconds;
  const maxViews = body?.max_views;

  if (typeof content !== "string" || content.trim().length === 0) {
    return badRequest("content must be a non-empty string");
  }
  if (ttl !== undefined && !isIntGe1(ttl)) {
    return badRequest("ttl_seconds must be an integer >= 1");
  }
  if (maxViews !== undefined && !isIntGe1(maxViews)) {
    return badRequest("max_views must be an integer >= 1");
  }

  const id = nanoid(10);
  const key = `paste:${id}`;
  const createdAtMs = Date.now();
  const expiresAtMs = ttl ? createdAtMs + ttl * 1000 : null;

  const payload: Record<string, string> = {
    content,
    created_at_ms: String(createdAtMs),
  };
  if (expiresAtMs !== null) payload.expires_at_ms = String(expiresAtMs);
  if (maxViews !== undefined) payload.remaining_views = String(maxViews);

  await redis.hset(key, payload);

  const origin = req.nextUrl.origin;
  return json(201, { id, url: `${origin}/p/${id}` });
}
