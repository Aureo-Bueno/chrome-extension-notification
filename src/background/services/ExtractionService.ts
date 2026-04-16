import type {
  ExtractionEntry,
  ExtractedLink,
} from "../../shared/contracts/messages.js";
import type {
  ExtractionRepositoryContract,
  PageExtractorGateway,
  TabsGateway,
} from "../domain/gateways.js";
import { IdService } from "./IdService.js";
import { TabPolicyService } from "./TabPolicyService.js";

/**
 * Domain service responsible for extracting and persisting page snapshots.
 */
export class ExtractionService {
  constructor(
    private readonly repository: ExtractionRepositoryContract,
    private readonly tabs: TabsGateway,
    private readonly extractor: PageExtractorGateway,
    private readonly tabPolicy: TabPolicyService,
    private readonly ids: IdService
  ) {}

  /**
   * Returns saved extraction entries.
   */
  async getAll(): Promise<ExtractionEntry[]> {
    return this.repository.getAll();
  }

  /**
   * Extracts current page data from a tab and stores a capped history.
   */
  async extract(tabId: number): Promise<ExtractionEntry> {
    const tab = await this.tabs.getById(tabId);
    if (!this.tabPolicy.isInjectable(tab)) {
      throw new Error(
        "This tab cannot be analyzed. Open a regular http/https page and try again."
      );
    }

    const extracted = await this.extractor.extract(tab.id);
    const entry = this.createEntry(tab, extracted.headings, extracted.links, extracted.excerpt);

    const currentEntries = await this.repository.getAll();
    const updatedEntries = [entry, ...currentEntries].slice(0, 40);
    await this.repository.saveAll(updatedEntries);

    return entry;
  }

  /**
   * Creates a persisted extraction entry from raw extracted page data.
   */
  private createEntry(
    tab: chrome.tabs.Tab & { id: number; url: string },
    headings: string[],
    links: ExtractedLink[],
    excerpt: string
  ): ExtractionEntry {
    const title = tab.title ?? tab.url;

    return {
      id: this.ids.create("extract"),
      url: tab.url,
      title,
      createdAt: Date.now(),
      headings,
      links,
      excerpt,
      markdown: this.buildMarkdown(title, tab.url, headings, links, excerpt),
      json: this.buildJson(title, tab.url, headings, links, excerpt),
    };
  }

  /**
   * Builds markdown output for an extraction entry.
   */
  private buildMarkdown(
    title: string,
    url: string,
    headings: string[],
    links: ExtractedLink[],
    excerpt: string
  ): string {
    const headingLines = headings.map((heading) => `- ${heading}`).join("\n");
    const linkLines = links
      .map((link) => `- [${link.text || link.href}](${link.href})`)
      .join("\n");

    return [
      `# ${title}`,
      "",
      `Source: ${url}`,
      `Captured: ${new Date().toISOString()}`,
      "",
      "## Headings",
      headingLines || "- No headings found",
      "",
      "## Important links",
      linkLines || "- No links found",
      "",
      "## Excerpt",
      excerpt || "No excerpt found",
    ].join("\n");
  }

  /**
   * Builds JSON output for an extraction entry.
   */
  private buildJson(
    title: string,
    url: string,
    headings: string[],
    links: ExtractedLink[],
    excerpt: string
  ): string {
    return JSON.stringify(
      {
        title,
        url,
        capturedAt: new Date().toISOString(),
        headings,
        links,
        excerpt,
      },
      null,
      2
    );
  }
}
