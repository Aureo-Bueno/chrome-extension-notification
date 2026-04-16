import { INJECTABLE_PROTOCOLS } from "../domain/constants.js";

/**
 * Validates whether a browser tab supports script injection.
 */
export class TabPolicyService {
  /**
   * Returns true when tab has id/url and uses an allowed protocol.
   */
  isInjectable(tab: chrome.tabs.Tab): tab is chrome.tabs.Tab & { id: number; url: string } {
    if (tab.id === undefined || !tab.url) {
      return false;
    }

    try {
      const protocol = new URL(tab.url).protocol;
      return INJECTABLE_PROTOCOLS.has(protocol);
    } catch {
      return false;
    }
  }
}
