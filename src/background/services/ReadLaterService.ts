import type {
  ReadLaterItem,
  SaveReadLaterPayload,
} from "../../shared/contracts/messages.js";
import type {
  AlarmsGateway,
  ReadLaterRepositoryContract,
  TabsGateway,
} from "../domain/gateways.js";
import { IdService } from "./IdService.js";
import { ReminderIdentityService } from "./ReminderIdentityService.js";

const MIN_REMINDER_LEAD_MS = 60_000;

/**
 * Domain service that manages read-later items and reminder lifecycle.
 */
export class ReadLaterService {
  constructor(
    private readonly repository: ReadLaterRepositoryContract,
    private readonly tabs: TabsGateway,
    private readonly alarms: AlarmsGateway,
    private readonly identity: ReminderIdentityService,
    private readonly ids: IdService
  ) {}

  /**
   * Returns all read-later items.
   */
  async getAll(): Promise<ReadLaterItem[]> {
    return this.repository.getAll();
  }

  /**
   * Creates a new read-later item and schedules an alarm when needed.
   */
  async save(payload: SaveReadLaterPayload): Promise<ReadLaterItem[]> {
    if (
      payload.remindAt !== undefined &&
      payload.remindAt <= Date.now() + MIN_REMINDER_LEAD_MS
    ) {
      throw new Error("Reminder must be at least 1 minute in the future.");
    }

    const items = await this.repository.getAll();
    const item: ReadLaterItem = {
      id: this.ids.create("item"),
      url: payload.url,
      title: payload.title || payload.url,
      createdAt: Date.now(),
      remindAt: payload.remindAt,
    };

    const updatedItems = [item, ...items];
    await this.repository.saveAll(updatedItems);

    if (item.remindAt && item.remindAt > Date.now()) {
      await this.alarms.create(this.identity.buildAlarmName(item.id), item.remindAt);
    }

    return updatedItems;
  }

  /**
   * Deletes a read-later item and clears its alarm.
   */
  async delete(itemId: string): Promise<ReadLaterItem[]> {
    const items = await this.repository.getAll();
    const updatedItems = items.filter((item) => item.id !== itemId);

    await this.repository.saveAll(updatedItems);
    await this.alarms.clear(this.identity.buildAlarmName(itemId));

    return updatedItems;
  }

  /**
   * Opens a stored read-later item in a new browser tab.
   */
  async open(itemId: string): Promise<void> {
    const item = await this.findById(itemId);
    if (!item) {
      throw new Error("Item not found.");
    }
    await this.tabs.open(item.url);
  }

  /**
   * Finds a stored item by id.
   */
  async findById(itemId: string): Promise<ReadLaterItem | undefined> {
    const items = await this.repository.getAll();
    return items.find((item) => item.id === itemId);
  }
}
