self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(openPages => {
      const page = openPages.find(client => new URL(client.url).origin === self.location.origin);
      return page ? page.focus() : self.clients.openWindow("/");
    }),
  );
});
