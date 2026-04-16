import type {
  ExtractionEntry,
} from "../../shared/contracts/messages.js";
import { STORAGE_KEYS } from "../domain/constants.js";
import type {
  ExtractionRepositoryContract,
  StorageGateway,
} from "../domain/gateways.js";

/**
 * Storage repository for extracted page snapshots.
 */
export class ExtractionRepository implements ExtractionRepositoryContract {
  constructor(private readonly storage: StorageGateway) {}

  /**
   * Returns all saved extraction entries.
   */
  async getAll(): Promise<ExtractionEntry[]> {
    return this.storage.get<ExtractionEntry[]>(STORAGE_KEYS.extractions, []);
  }

  /**
   * Replaces all saved extraction entries.
   */
  async saveAll(extractions: ExtractionEntry[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.extractions, extractions);
  }
}
