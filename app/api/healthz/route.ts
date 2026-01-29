import { redis } from "@/lib/redis";
import { json } from "@/lib/validate";

export async function GET() {
  try {
    const pong = await redis.ping();
    return json(200, { ok: pong === "PONG" });
  } catch {
    return json(200, { ok: false });
  }
}
