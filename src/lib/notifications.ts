/** Local browser notification scheduling for the daily reminders. */

let timers: ReturnType<typeof setTimeout>[] = [];

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return "unsupported" as const;
  return Notification.requestPermission();
}

function msUntil(hhmm: string) {
  const [h, m] = hhmm.split(":").map((n) => Number.parseInt(n, 10));
  const target = new Date();
  target.setHours(h ?? 0, m ?? 0, 0, 0);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  return target.getTime() - Date.now();
}

function show(title: string, body: string) {
  if (notificationPermission() !== "granted") return;
  new Notification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png" });
}

export function clearReminders() {
  timers.forEach(clearTimeout);
  timers = [];
}

export function scheduleReminders(times: { morning: string; night: string }) {
  clearReminders();
  if (notificationPermission() !== "granted") return;

  const plan = (time: string, title: string, body: string) => {
    const fire = () => {
      show(title, body);
      timers.push(setTimeout(fire, 24 * 60 * 60 * 1000));
    };
    timers.push(setTimeout(fire, msUntil(time)));
  };

  plan(times.morning, "CueX", "Your mission starts now.");
  plan(times.night, "CueX", "Plan tomorrow before sleeping.");
}
