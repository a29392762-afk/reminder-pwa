import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const sub = await req.json();
  if (!sub?.endpoint) return new Response("Bad Request: missing endpoint", { status: 400 });

  const store = getStore("push");
  const key = `sub:${encodeURIComponent(sub.endpoint)}`;

  await store.setJSON(key, sub);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
};
