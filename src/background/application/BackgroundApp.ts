import type {
  RuntimeMessage,
  RuntimeResponse,
} from "../../shared/contracts/messages.js";
import { MessageHandler } from "./MessageHandler.js";
import { NotificationService } from "../services/NotificationService.js";

/**
 * Entry application object that wires Chrome event listeners.
 */
export class BackgroundApp {
  constructor(
    private readonly messageHandler: MessageHandler,
    private readonly notifications: NotificationService
  ) {}

  /**
   * Registers runtime, alarm, and notification listeners.
   */
  start(): void {
    chrome.runtime.onMessage.addListener(
      (message: RuntimeMessage, _sender, sendResponse): boolean => {
        void this.messageHandler
          .handle(message)
          .then((response) => {
            sendResponse(response);
          })
          .catch((error: unknown) => {
            const errorMessage =
              error instanceof Error ? error.message : "Unexpected error.";
            sendResponse({
              ok: false,
              error: errorMessage,
            } satisfies RuntimeResponse);
          });

        return true;
      }
    );

    chrome.alarms.onAlarm.addListener((alarm) => {
      void this.notifications.showReminderFromAlarm(alarm.name);
    });

    chrome.notifications.onClicked.addListener((notificationId) => {
      void this.notifications.handleNotificationClick(notificationId);
    });

    chrome.notifications.onButtonClicked.addListener(
      (notificationId, buttonIndex) => {
        void this.notifications.handleNotificationButtonClick(
          notificationId,
          buttonIndex
        );
      }
    );
  }
}
