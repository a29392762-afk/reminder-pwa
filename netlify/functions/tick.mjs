import { getStore } from "@netlify/blobs";
import webpush from "web-push";

function startOfTodayTaipei() {
  const now = new Date();
  const tw = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  tw.setHours(0,0,0,0);
  return tw;
}
function toDate0(ymd) {
  const d = new Date(ymd);
  d.setHours(0,0,0,0);
  return d;
}
function daysLeft(dueDate) {
  return Math.ceil((toDate0(dueDate) - startOfTodayTaipei()) / 86400000);
}
function statusOf(dueDate) {
  const dl = daysLeft(dueDate);
  if (dl < 0) return { s:'overdue', dl };
  if (dl === 0) return { s:'due', dl };
  if (dl <= 2) return { s:'soon', dl }; // 到期前 2 天
  return { s:'ok', dl };
}

export default async () => {
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
  const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:you@example.com";

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response("Missing VAPID keys", { status: 500 });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const dataStore = getStore("data");
  const pushStore = getStore("push");

  const reminders = (await dataStore.getJSON("reminders", { defaultValue: [] })) || [];

  // 取出所有訂閱
  const listed = await pushStore.list({ prefix: "sub:" });
  const subs = [];
  for (const item of (listed?.blobs || [])) {
    const sub = await pushStore.getJSON(item.key);
    if (sub?.endpoint) subs.push({ key: item.key, sub });
  }

  // 無訂閱就不做推播，但仍回傳狀態
  if (subs.length === 0) {
    return new Response(JSON.stringify({ ok:true, subs:0, reminders: reminders.length }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const next = [];

  for (const r of reminders) {
    const { s, dl } = statusOf(r.dueDate);

    if (s === 'ok') {
      next.push(r);
      continue;
    }

    // 發送推播
    const title = `⏰ 提醒：${r.title}`;
    const body =
      s === 'overdue' ? `已逾期（到期日：${r.dueDate}）`
      : s === 'due' ? `今天到期（${r.dueDate}）`
      : `快到了（到期日：${r.dueDate}，剩 ${dl} 天）`;

    const payload = JSON.stringify({ title, body, url: "/" });

    for (const { key, sub } of subs) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (e) {
        // endpoint 失效就刪掉訂閱
        await pushStore.delete(key);
      }
    }

    // ✅ 到期/逾期推播後自動刪除；快到了不刪
    if (s === 'soon') next.push(r);
  }

  await dataStore.setJSON("reminders", next);

  return new Response(JSON.stringify({
    ok: true,
    subs: subs.length,
    before: reminders.length,
    after: next.length
  }), { headers: { "Content-Type": "application/json" } });
};
