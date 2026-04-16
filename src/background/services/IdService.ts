/**
 * Generates simple unique identifiers for domain entities.
 */
export class IdService {
  /**
   * Creates an id with a semantic prefix.
   */
  create(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }
}
