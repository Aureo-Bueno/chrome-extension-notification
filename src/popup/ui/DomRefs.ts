function requireElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element;
}

export class DomRefs {
  readonly currentPageEl = requireElement<HTMLElement>("#currentPage");
  readonly domainBadgeEl = requireElement<HTMLElement>("#domainBadge");
  readonly alarmSummaryEl = requireElement<HTMLElement>("#alarmSummary");
  readonly notificationPermissionEl = requireElement<HTMLElement>(
    "#notificationPermission"
  );
  readonly testNotificationButton = requireElement<HTMLButtonElement>(
    "#testNotification"
  );

  readonly reminderInput = requireElement<HTMLInputElement>("#reminderAt");
  readonly saveReadLaterButton = requireElement<HTMLButtonElement>("#saveReadLater");
  readonly preset30mButton = requireElement<HTMLButtonElement>("#preset30m");
  readonly preset3hButton = requireElement<HTMLButtonElement>("#preset3h");
  readonly clearReminderInputButton = requireElement<HTMLButtonElement>(
    "#clearReminderInput"
  );
  readonly readLaterStatusEl = requireElement<HTMLElement>("#readLaterStatus");
  readonly readLaterListEl = requireElement<HTMLUListElement>("#readLaterList");

  readonly siteNoteInput = requireElement<HTMLTextAreaElement>("#siteNote");
  readonly saveNoteButton = requireElement<HTMLButtonElement>("#saveNote");
  readonly noteStatusEl = requireElement<HTMLElement>("#noteStatus");

  readonly extractButton = requireElement<HTMLButtonElement>("#extractNow");
  readonly copyMarkdownButton = requireElement<HTMLButtonElement>("#copyMarkdown");
  readonly copyJsonButton = requireElement<HTMLButtonElement>("#copyJson");
  readonly extractStatusEl = requireElement<HTMLElement>("#extractStatus");
  readonly extractionListEl = requireElement<HTMLUListElement>("#extractionList");

  readonly tabButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".tab[data-tab-target]")
  );
  readonly tabPanels = Array.from(document.querySelectorAll<HTMLElement>(".panel"));
}
