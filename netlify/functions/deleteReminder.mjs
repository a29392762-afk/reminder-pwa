import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { id } = await req.json();
  const store = getStore("data");

  const raw = await store.get("reminders");
  const list = raw ? JSON.parse(raw) : [];

  const next = list.filter(r => r.id !== id);
  await store.set("reminders", JSON.stringify(next));

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
};
