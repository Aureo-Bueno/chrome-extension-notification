import type { ReadLaterItem } from "../../shared/contracts/messages.js";
import { RuntimeClient } from "../infrastructure/RuntimeClient.js";
import type { PopupState } from "../domain/PopupState.js";
import { formatDate, toDatetimeLocalValue } from "../utils/date.js";
import { TextView } from "../ui/TextView.js";

const MIN_REMINDER_LEAD_MS = 60_000;

interface ReadLaterView {
  reminderInput: HTMLInputElement;
  saveButton: HTMLButtonElement;
  preset30mButton: HTMLButtonElement;
  preset3hButton: HTMLButtonElement;
  clearReminderInputButton: HTMLButtonElement;
  statusElement: HTMLElement;
  listElement: HTMLUListElement;
  summaryElement: HTMLElement;
}

export class ReadLaterController {
  constructor(
    private readonly runtime: RuntimeClient,
    private readonly state: PopupState,
    private readonly view: ReadLaterView,
    private readonly textView: TextView
  ) {}

  bind(): void {
    this.view.saveButton.addEventListener("click", () => {
      void this.saveCurrentPage();
    });

    this.view.preset30mButton.addEventListener("click", () => {
      this.view.reminderInput.value = toDatetimeLocalValue(Date.now() + 30 * 60 * 1000);
    });

    this.view.preset3hButton.addEventListener("click", () => {
      this.view.reminderInput.value = toDatetimeLocalValue(Date.now() + 3 * 60 * 60 * 1000);
    });

    this.view.clearReminderInputButton.addEventListener("click", () => {
      this.view.reminderInput.value = "";
      this.setStatus("Reminder date cleared.");
    });
  }

  async refresh(): Promise<void> {
    const response = await this.runtime.send({ type: "get-read-later" });
    if (!response.ok || !response.readLaterItems) {
      this.setStatus(response.error ?? "Could not load saved pages.");
      return;
    }

    this.render(response.readLaterItems);
  }

  setStatus(message: string): void {
    this.textView.set(this.view.statusElement, message);
  }

  private async saveCurrentPage(): Promise<void> {
    if (!this.state.activeTab?.url) {
      this.setStatus("Active tab is not available.");
      return;
    }

    const remindAtValue = this.view.reminderInput.value;
    const remindAt = remindAtValue
      ? new Date(remindAtValue).getTime()
      : undefined;

    if (remindAt !== undefined && Number.isNaN(remindAt)) {
      this.setStatus("Reminder date is invalid.");
      return;
    }

    if (remindAt !== undefined && remindAt <= Date.now() + MIN_REMINDER_LEAD_MS) {
      this.setStatus("Reminder must be at least 1 minute in the future.");
      return;
    }

    const response = await this.runtime.send({
      type: "save-read-later",
      payload: {
        url: this.state.activeTab.url,
        title: this.state.activeTab.title ?? this.state.activeTab.url,
        remindAt,
      },
    });

    if (!response.ok || !response.readLaterItems) {
      this.setStatus(response.error ?? "Could not save page.");
      return;
    }

    this.render(response.readLaterItems);
    this.setStatus("Page saved.");
  }

  private render(items: ReadLaterItem[]): void {
    this.view.listElement.innerHTML = "";

    if (items.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "item";
      emptyItem.textContent = "No saved pages yet.";
      this.view.listElement.appendChild(emptyItem);
      this.updateReminderSummary([]);
      return;
    }

    this.updateReminderSummary(items);

    items.slice(0, 12).forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = "item";

      const title = document.createElement("div");
      title.className = "item-title";
      title.textContent = item.title;
      listItem.appendChild(title);

      const meta = document.createElement("div");
      meta.className = "item-meta";
      meta.textContent = `${this.getReminderText(item)} | Added: ${formatDate(item.createdAt)}`;
      listItem.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "item-actions";

      const openButton = document.createElement("button");
      openButton.type = "button";
      openButton.textContent = "Open";
      openButton.addEventListener("click", () => {
        void this.openItem(item.id);
      });
      actions.appendChild(openButton);

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.className = "danger";
      deleteButton.addEventListener("click", () => {
        void this.deleteItem(item.id);
      });
      actions.appendChild(deleteButton);

      listItem.appendChild(actions);
      this.view.listElement.appendChild(listItem);
    });
  }

  private getReminderText(item: ReadLaterItem): string {
    if (item.remindAt === undefined) {
      return "No reminder (no notification)";
    }

    if (item.remindAt > Date.now()) {
      return `Scheduled reminder: ${formatDate(item.remindAt)}`;
    }

    return `Reminder was set to past time: ${formatDate(item.remindAt)}`;
  }

  private updateReminderSummary(items: ReadLaterItem[]): void {
    const now = Date.now();
    const scheduled = items
      .filter((item) => item.remindAt !== undefined && item.remindAt > now)
      .map((item) => item.remindAt as number)
      .sort((a, b) => a - b);

    if (scheduled.length === 0) {
      this.textView.set(this.view.summaryElement, "Reminders: none");
      return;
    }

    this.textView.set(
      this.view.summaryElement,
      `Reminders: ${scheduled.length} | Next: ${formatDate(scheduled[0])}`
    );
  }

  private async openItem(itemId: string): Promise<void> {
    const response = await this.runtime.send({
      type: "open-read-later",
      payload: { id: itemId },
    });

    if (!response.ok) {
      this.setStatus(response.error ?? "Could not open page.");
    }
  }

  private async deleteItem(itemId: string): Promise<void> {
    const response = await this.runtime.send({
      type: "delete-read-later",
      payload: { id: itemId },
    });

    if (!response.ok || !response.readLaterItems) {
      this.setStatus(response.error ?? "Could not delete page.");
      return;
    }

    this.render(response.readLaterItems);
    this.setStatus("Saved item removed.");
  }
}
