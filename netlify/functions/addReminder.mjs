import { getStore } from "@netlify/blobs";

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

export default async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const body = await req.json();
    const { title, startDate, useDays, dueDate } = body;

    if (!title || !startDate || !useDays || !dueDate) {
      return new Response(JSON.stringify({ error: "Missing fields", body }), { status: 400 });
    }

    const store = getStore("data");

    const reminder = {
      id: makeId(),
      title: String(title).slice(0, 120),
      startDate,
      useDays: Number(useDays) || 0,
      dueDate,
      createdAt: Date.now()
    };

    const list = (await store.getJSON("reminders", { defaultValue: [] })) || [];
    list.unshift(reminder);

    await store.setJSON("reminders", list);

    return new Response(JSON.stringify({ ok: true, reminder }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
