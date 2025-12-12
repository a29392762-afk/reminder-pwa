import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const { id } = await req.json();
  if (!id) return new Response("Bad Request: missing id", { status: 400 });

  const store = getStore("data");
  const list = (await store.getJSON("reminders", { defaultValue: [] })) || [];
  const next = list.filter(r => r.id !== id);
  await store.setJSON("reminders", next);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
};
