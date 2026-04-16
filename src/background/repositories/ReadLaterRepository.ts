import type { ReadLaterItem } from "../../shared/contracts/messages.js";
import { STORAGE_KEYS } from "../domain/constants.js";
import type {
  ReadLaterRepositoryContract,
  StorageGateway,
} from "../domain/gateways.js";

/**
 * Storage repository for read-later items.
 */
export class ReadLaterRepository implements ReadLaterRepositoryContract {
  constructor(private readonly storage: StorageGateway) {}

  /**
   * Returns all persisted read-later items.
   */
  async getAll(): Promise<ReadLaterItem[]> {
    return this.storage.get<ReadLaterItem[]>(STORAGE_KEYS.readLaterItems, []);
  }

  /**
   * Replaces all persisted read-later items.
   */
  async saveAll(items: ReadLaterItem[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.readLaterItems, items);
  }
}
