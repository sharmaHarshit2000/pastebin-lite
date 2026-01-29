export function isIntGe1(x: unknown): x is number {
  return typeof x === "number" && Number.isInteger(x) && x >= 1;
}

export function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function badRequest(message: string) {
  return json(400, { error: message });
}

export function notFoundJson() {
  return json(404, { error: "not_found" });
}
