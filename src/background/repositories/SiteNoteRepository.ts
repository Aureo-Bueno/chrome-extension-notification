import type {
  SiteNoteEntry,
} from "../../shared/contracts/messages.js";
import { STORAGE_KEYS } from "../domain/constants.js";
import type {
  SiteNoteRepositoryContract,
  StorageGateway,
} from "../domain/gateways.js";

/**
 * Storage repository for notes keyed by domain.
 */
export class SiteNoteRepository implements SiteNoteRepositoryContract {
  constructor(private readonly storage: StorageGateway) {}

  /**
   * Returns all stored domain notes.
   */
  async getAll(): Promise<Record<string, SiteNoteEntry>> {
    return this.storage.get<Record<string, SiteNoteEntry>>(STORAGE_KEYS.siteNotes, {});
  }

  /**
   * Replaces all stored domain notes.
   */
  async saveAll(notes: Record<string, SiteNoteEntry>): Promise<void> {
    await this.storage.set(STORAGE_KEYS.siteNotes, notes);
  }
}
