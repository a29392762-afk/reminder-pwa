import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("data");
  const raw = await store.get("reminders");
  const reminders = raw ? JSON.parse(raw) : [];

  return new Response(JSON.stringify({ reminders }), {
    headers: { "Content-Type": "application/json" }
  });
};
