/**
 * Adapter around popup-specific Chrome APIs.
 */
export class ChromePopupEnvironment {
  /**
   * Returns the current active tab from the focused window.
   */
  async getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab ?? null;
  }

  /**
   * Returns current notification permission level.
   */
  async getNotificationPermission(): Promise<string> {
    return new Promise<string>((resolve) => {
      chrome.notifications.getPermissionLevel((level) => resolve(level));
    });
  }
}
