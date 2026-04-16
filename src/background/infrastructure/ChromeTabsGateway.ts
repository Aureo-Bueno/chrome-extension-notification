import type { TabsGateway } from "../domain/gateways.js";

/**
 * Adapter around Chrome Tabs API used by background services.
 */
export class ChromeTabsGateway implements TabsGateway {
  /**
   * Retrieves a browser tab by its unique id.
   */
  async getById(tabId: number): Promise<chrome.tabs.Tab> {
    return chrome.tabs.get(tabId);
  }

  /**
   * Opens a new tab for the provided URL.
   */
  async open(url: string): Promise<void> {
    await chrome.tabs.create({ url });
  }
}
