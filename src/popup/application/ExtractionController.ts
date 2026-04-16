import type { ExtractionEntry } from "../../shared/contracts/messages.js";
import type { PopupState } from "../domain/PopupState.js";
import { RuntimeClient } from "../infrastructure/RuntimeClient.js";
import { formatDate } from "../utils/date.js";
import { isInjectableUrl } from "../utils/url.js";
import { TextView } from "../ui/TextView.js";

interface ExtractionView {
  extractButton: HTMLButtonElement;
  copyMarkdownButton: HTMLButtonElement;
  copyJsonButton: HTMLButtonElement;
  statusElement: HTMLElement;
  listElement: HTMLUListElement;
}

export class ExtractionController {
  private latestExtraction: ExtractionEntry | null = null;

  constructor(
    private readonly runtime: RuntimeClient,
    private readonly state: PopupState,
    private readonly view: ExtractionView,
    private readonly textView: TextView
  ) {}

  bind(): void {
    this.view.extractButton.addEventListener("click", () => {
      void this.extract();
    });

    this.view.copyMarkdownButton.addEventListener("click", () => {
      void this.copyMarkdown();
    });

    this.view.copyJsonButton.addEventListener("click", () => {
      void this.copyJson();
    });
  }

  async refresh(): Promise<void> {
    const response = await this.runtime.send({ type: "get-extractions" });

    if (!response.ok || !response.extractions) {
      this.setStatus(response.error ?? "Could not load extractions.");
      return;
    }

    this.render(response.extractions);
  }

  private async extract(): Promise<void> {
    if (
      !this.state.activeTab?.id ||
      !this.state.activeTab.url ||
      !isInjectableUrl(this.state.activeTab.url)
    ) {
      this.setStatus("Open a regular website (http/https) before extracting.");
      return;
    }

    this.setStatus("Extracting...");

    const response = await this.runtime.send({
      type: "extract-page",
      payload: { tabId: this.state.activeTab.id },
    });

    if (!response.ok || !response.extraction) {
      this.setStatus(response.error ?? "Could not extract this page.");
      return;
    }

    this.setStatus("Extraction complete.");
    await this.refresh();
  }

  private render(entries: ExtractionEntry[]): void {
    this.view.listElement.innerHTML = "";

    if (entries.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "item";
      emptyItem.textContent = "No extractions yet.";
      this.view.listElement.appendChild(emptyItem);
      this.view.copyMarkdownButton.disabled = true;
      this.view.copyJsonButton.disabled = true;
      this.latestExtraction = null;
      return;
    }

    this.latestExtraction = entries[0];
    this.view.copyMarkdownButton.disabled = false;
    this.view.copyJsonButton.disabled = false;

    entries.slice(0, 8).forEach((entry) => {
      const listItem = document.createElement("li");
      listItem.className = "item";

      const title = document.createElement("div");
      title.className = "item-title";
      title.textContent = entry.title;
      listItem.appendChild(title);

      const meta = document.createElement("div");
      meta.className = "item-meta";
      meta.textContent = `Headings: ${entry.headings.length} | Links: ${entry.links.length} | ${formatDate(entry.createdAt)}`;
      listItem.appendChild(meta);

      this.view.listElement.appendChild(listItem);
    });
  }

  private async copyMarkdown(): Promise<void> {
    if (!this.latestExtraction) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.latestExtraction.markdown);
      this.setStatus("Markdown copied.");
    } catch {
      this.setStatus("Could not copy Markdown.");
    }
  }

  private async copyJson(): Promise<void> {
    if (!this.latestExtraction) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.latestExtraction.json);
      this.setStatus("JSON copied.");
    } catch {
      this.setStatus("Could not copy JSON.");
    }
  }

  private setStatus(message: string): void {
    this.textView.set(this.view.statusElement, message);
  }
}
