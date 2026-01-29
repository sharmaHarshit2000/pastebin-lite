import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { redis } from "@/lib/redis";
import { READ_NO_DECR_LUA } from "@/lib/lua";
import { getExpiryNowMsFromHeaders } from "@/lib/now";

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

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const key = `paste:${id}`;

  const h = await headers();
  const nowMs = getExpiryNowMsFromHeaders(h);

  const raw = await redis.eval(READ_NO_DECR_LUA, [key], [String(nowMs)]);
  const res = normalizeEvalResult(raw);

  if (!res || res[0] !== 1) notFound();

  const content = String(res[1] ?? "");

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "48px 16px",
        background: "#0b0b0d",
        color: "#f5f5f7",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          background: "#111114",
          border: "1px solid #232327",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <h1 style={{ fontSize: 26, marginBottom: 14 }}>Paste</h1>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            padding: 14,
            borderRadius: 12,
            background: "#0f0f12",
            border: "1px solid #2a2a30",
          }}
        >
          {content}
        </pre>
      </div>
    </div>
  );
}
