export default async () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return new Response(JSON.stringify({ error: "Missing VAPID_PUBLIC_KEY" }), { status: 500 });
  }
  return new Response(JSON.stringify({ publicKey }), {
    headers: { "Content-Type": "application/json" }
  });
};
