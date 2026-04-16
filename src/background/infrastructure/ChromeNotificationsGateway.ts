import type { NotificationsGateway } from "../domain/gateways.js";

/**
 * Adapter around Chrome Notifications API.
 */
export class ChromeNotificationsGateway implements NotificationsGateway {
  /**
   * Creates or replaces a browser notification.
   */
  async create(
    notificationId: string,
    options: chrome.notifications.NotificationCreateOptions
  ): Promise<void> {
    await chrome.notifications.create(notificationId, options);
  }

  /**
   * Clears a notification by id.
   */
  async clear(notificationId: string): Promise<void> {
    await chrome.notifications.clear(notificationId);
  }
}
