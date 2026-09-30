export async function notifyUser(
  title: string,
  options: NotificationOptions,
  isRelevant: () => boolean = () => true,
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted" || !isRelevant()) return false;

  const showWindowNotification = () => {
    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  try {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register("/notifications-sw.js");
      const registration = await navigator.serviceWorker.ready;
      if (!isRelevant() || Notification.permission !== "granted") return false;
      await registration.showNotification(title, options);
    } else {
      showWindowNotification();
    }
    return true;
  } catch {
    if (!isRelevant() || Notification.permission !== "granted") return false;
    try {
      showWindowNotification();
      return true;
    } catch {
      return false;
    }
  }
}
