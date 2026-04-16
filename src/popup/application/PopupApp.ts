import { PopupState } from "../domain/PopupState.js";
import { ChromePopupEnvironment } from "../infrastructure/ChromePopupEnvironment.js";
import { RuntimeClient } from "../infrastructure/RuntimeClient.js";
import { DomRefs } from "../ui/DomRefs.js";
import { TabNavigator } from "../ui/TabNavigator.js";
import { TextView } from "../ui/TextView.js";
import { isInjectableUrl, parseDomain } from "../utils/url.js";
import { ExtractionController } from "./ExtractionController.js";
import { ReadLaterController } from "./ReadLaterController.js";
import { SiteNoteController } from "./SiteNoteController.js";

export class PopupApp {
  private readonly state = new PopupState();
  private readonly refs = new DomRefs();
  private readonly textView = new TextView();
  private readonly runtime = new RuntimeClient();
  private readonly environment = new ChromePopupEnvironment();
  private readonly tabNavigator = new TabNavigator(
    this.refs.tabButtons,
    this.refs.tabPanels
  );

  private readonly readLaterController = new ReadLaterController(
    this.runtime,
    this.state,
    {
      reminderInput: this.refs.reminderInput,
      saveButton: this.refs.saveReadLaterButton,
      preset30mButton: this.refs.preset30mButton,
      preset3hButton: this.refs.preset3hButton,
      clearReminderInputButton: this.refs.clearReminderInputButton,
      statusElement: this.refs.readLaterStatusEl,
      listElement: this.refs.readLaterListEl,
      summaryElement: this.refs.alarmSummaryEl,
    },
    this.textView
  );

  private readonly siteNoteController = new SiteNoteController(
    this.runtime,
    this.state,
    {
      input: this.refs.siteNoteInput,
      saveButton: this.refs.saveNoteButton,
      statusElement: this.refs.noteStatusEl,
    },
    this.textView
  );

  private readonly extractionController = new ExtractionController(
    this.runtime,
    this.state,
    {
      extractButton: this.refs.extractButton,
      copyMarkdownButton: this.refs.copyMarkdownButton,
      copyJsonButton: this.refs.copyJsonButton,
      statusElement: this.refs.extractStatusEl,
      listElement: this.refs.extractionListEl,
    },
    this.textView
  );

  async start(): Promise<void> {
    this.tabNavigator.bind();
    this.readLaterController.bind();
    this.siteNoteController.bind();
    this.extractionController.bind();
    this.bindActions();

    await this.loadActiveTabContext();

    await Promise.all([
      this.readLaterController.refresh(),
      this.siteNoteController.refresh(),
      this.extractionController.refresh(),
      this.refreshNotificationPermission(),
    ]);
  }

  private bindActions(): void {
    this.refs.testNotificationButton.addEventListener("click", () => {
      void this.sendTestNotification();
    });
  }

  private async loadActiveTabContext(): Promise<void> {
    this.state.activeTab = await this.environment.getCurrentTab();

    if (!this.state.activeTab?.url) {
      this.textView.set(this.refs.currentPageEl, "Could not detect active tab.");
      this.textView.set(this.refs.domainBadgeEl, "Domain: unavailable");
      return;
    }

    this.textView.set(
      this.refs.currentPageEl,
      this.state.activeTab.title ?? this.state.activeTab.url
    );

    if (isInjectableUrl(this.state.activeTab.url)) {
      this.state.activeDomain = parseDomain(this.state.activeTab.url);
      this.textView.set(this.refs.domainBadgeEl, `Domain: ${this.state.activeDomain}`);
      return;
    }

    this.state.activeDomain = "";
    this.textView.set(this.refs.domainBadgeEl, "Domain: not supported");
  }

  private async refreshNotificationPermission(): Promise<void> {
    const permission = await this.environment.getNotificationPermission();
    this.textView.set(
      this.refs.notificationPermissionEl,
      `Notifications: ${permission}`
    );
  }

  private async sendTestNotification(): Promise<void> {
    const response = await this.runtime.send({ type: "test-notification" });
    if (!response.ok) {
      this.readLaterController.setStatus(
        response.error ?? "Could not trigger notification."
      );
      return;
    }

    this.readLaterController.setStatus("Test notification sent.");
    await this.refreshNotificationPermission();
  }
}
