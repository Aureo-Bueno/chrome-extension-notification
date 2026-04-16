import { REMINDER } from "../domain/constants.js";

/**
 * Encapsulates alarm/notification naming conventions for reminders.
 */
export class ReminderIdentityService {
  /**
   * Builds an alarm name for a read-later item.
   */
  buildAlarmName(itemId: string): string {
    return `${REMINDER.alarmPrefix}${itemId}`;
  }

  /**
   * Extracts a read-later item id from an alarm name.
   */
  itemIdFromAlarmName(alarmName: string): string | null {
    if (!alarmName.startsWith(REMINDER.alarmPrefix)) {
      return null;
    }
    return alarmName.slice(REMINDER.alarmPrefix.length);
  }

  /**
   * Builds a notification id for a read-later item.
   */
  buildNotificationId(itemId: string): string {
    return `${REMINDER.notificationPrefix}${itemId}`;
  }

  /**
   * Extracts a read-later item id from a notification id.
   */
  itemIdFromNotificationId(notificationId: string): string | null {
    if (!notificationId.startsWith(REMINDER.notificationPrefix)) {
      return null;
    }
    return notificationId.slice(REMINDER.notificationPrefix.length);
  }
}
