import { RuntimeClient } from "../infrastructure/RuntimeClient.js";
import type { PopupState } from "../domain/PopupState.js";
import { TextView } from "../ui/TextView.js";

interface SiteNoteView {
  input: HTMLTextAreaElement;
  saveButton: HTMLButtonElement;
  statusElement: HTMLElement;
}

export class SiteNoteController {
  constructor(
    private readonly runtime: RuntimeClient,
    private readonly state: PopupState,
    private readonly view: SiteNoteView,
    private readonly textView: TextView
  ) {}

  bind(): void {
    this.view.saveButton.addEventListener("click", () => {
      void this.save();
    });
  }

  async refresh(): Promise<void> {
    if (!this.state.activeDomain) {
      this.view.input.value = "";
      this.setStatus("Open a regular page to manage domain notes.");
      return;
    }

    const response = await this.runtime.send({
      type: "get-site-note",
      payload: { domain: this.state.activeDomain },
    });

    if (!response.ok) {
      this.setStatus(response.error ?? "Could not load site note.");
      return;
    }

    this.view.input.value = response.note ?? "";
    this.setStatus("");
  }

  private async save(): Promise<void> {
    if (!this.state.activeDomain) {
      this.setStatus("Open a regular http/https page to save a domain note.");
      return;
    }

    const response = await this.runtime.send({
      type: "save-site-note",
      payload: {
        domain: this.state.activeDomain,
        note: this.view.input.value,
      },
    });

    if (!response.ok) {
      this.setStatus(response.error ?? "Could not save note.");
      return;
    }

    this.setStatus("Note saved.");
  }

  private setStatus(message: string): void {
    this.textView.set(this.view.statusElement, message);
  }
}
