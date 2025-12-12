import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("data");
  const reminders = await store.getJSON("reminders", { defaultValue: [] });
  return new Response(JSON.stringify({ reminders }), {
    headers: { "Content-Type": "application/json" }
  });
};
