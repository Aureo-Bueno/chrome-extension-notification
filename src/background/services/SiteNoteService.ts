import type { SiteNoteRepositoryContract } from "../domain/gateways.js";

/**
 * Domain service for reading and writing notes by site domain.
 */
export class SiteNoteService {
  constructor(private readonly repository: SiteNoteRepositoryContract) {}

  /**
   * Returns the current note text for a domain.
   */
  async get(domain: string): Promise<string> {
    const notes = await this.repository.getAll();
    return notes[domain]?.note ?? "";
  }

  /**
   * Persists note content for a domain.
   */
  async save(domain: string, note: string): Promise<void> {
    const notes = await this.repository.getAll();
    notes[domain] = {
      note,
      updatedAt: Date.now(),
    };

    await this.repository.saveAll(notes);
  }
}
