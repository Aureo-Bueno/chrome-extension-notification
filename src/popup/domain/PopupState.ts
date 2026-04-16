import type { ExtractionEntry } from "../../shared/contracts/messages.js";

/**
 * In-memory popup state shared across feature controllers.
 */
export class PopupState {
  /** Currently active browser tab. */
  activeTab: chrome.tabs.Tab | null = null;
  /** Parsed domain of current tab when available. */
  activeDomain = "";
  /** Most recently extracted page snapshot. */
  latestExtraction: ExtractionEntry | null = null;
}
