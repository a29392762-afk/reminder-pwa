import { getStore } from "@netlify/blobs";

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { title, startDate, useDays, dueDate } = await req.json();
    if (!title || !startDate || !useDays || !dueDate) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const store = getStore("data");

    const raw = await store.get("reminders");
    const list = raw ? JSON.parse(raw) : [];

    const reminder = {
      id: makeId(),
      title,
      startDate,
      useDays: Number(useDays),
      dueDate,
      createdAt: Date.now()
    };

    list.unshift(reminder);
    await store.set("reminders", JSON.stringify(list));

    return new Response(JSON.stringify({ ok: true, reminder }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
