import type { AlarmsGateway } from "../domain/gateways.js";

/**
 * Adapter around Chrome Alarms API used by reminder logic.
 */
export class ChromeAlarmsGateway implements AlarmsGateway {
  /**
   * Schedules an alarm to fire at a specific timestamp.
   */
  async create(name: string, when: number): Promise<void> {
    await chrome.alarms.create(name, { when });
  }

  /**
   * Clears a scheduled alarm by name.
   */
  async clear(name: string): Promise<void> {
    await chrome.alarms.clear(name);
  }
}
