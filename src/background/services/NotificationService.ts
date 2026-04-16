import { REMINDER } from "../domain/constants.js";
import type {
  AlarmsGateway,
  NotificationsGateway,
} from "../domain/gateways.js";
import { ReadLaterService } from "./ReadLaterService.js";
import { ReminderIdentityService } from "./ReminderIdentityService.js";

/**
 * Domain service for reminder and test notifications.
 */
export class NotificationService {
  private readonly notificationIconUrl = chrome.runtime.getURL("icon.png");

  constructor(
    private readonly notifications: NotificationsGateway,
    private readonly alarms: AlarmsGateway,
    private readonly readLater: ReadLaterService,
    private readonly identity: ReminderIdentityService
  ) {}

  /**
   * Shows reminder notification when a read-later alarm fires.
   */
  async showReminderFromAlarm(alarmName: string): Promise<void> {
    const itemId = this.identity.itemIdFromAlarmName(alarmName);
    if (!itemId) {
      return;
    }

    const item = await this.readLater.findById(itemId);
    if (!item) {
      return;
    }

    await this.notifications.create(this.identity.buildNotificationId(item.id), {
      type: "basic",
      title: "Reminder: read this page",
      message: item.title,
      iconUrl: this.notificationIconUrl,
      priority: 2,
      buttons: [{ title: "Open now" }, { title: "Snooze 30 min" }],
    });
  }

  /**
   * Sends an immediate test notification for diagnostics.
   */
  async showTestNotification(): Promise<void> {
    await this.notifications.create(`test-${Date.now()}`, {
      type: "basic",
      title: "Test notification",
      message: "Notifications are working for Productivity Assistant.",
      iconUrl: this.notificationIconUrl,
      priority: 2,
    });
  }

  /**
   * Handles notification body click and opens associated page.
   */
  async handleNotificationClick(notificationId: string): Promise<void> {
    const itemId = this.identity.itemIdFromNotificationId(notificationId);
    if (!itemId) {
      return;
    }

    await this.readLater.open(itemId);
    await this.notifications.clear(notificationId);
  }

  /**
   * Handles notification action buttons (open now / snooze).
   */
  async handleNotificationButtonClick(
    notificationId: string,
    buttonIndex: number
  ): Promise<void> {
    const itemId = this.identity.itemIdFromNotificationId(notificationId);
    if (!itemId) {
      return;
    }

    if (buttonIndex === 0) {
      await this.readLater.open(itemId);
      await this.notifications.clear(notificationId);
      return;
    }

    if (buttonIndex === 1) {
      const alarmName = this.identity.buildAlarmName(itemId);
      await this.alarms.create(alarmName, Date.now() + REMINDER.snoozeMs);
      await this.notifications.clear(notificationId);
    }
  }
}
