export const INJECTABLE_PROTOCOLS = new Set(["http:", "https:"]);

export const STORAGE_KEYS = {
  readLaterItems: "readLaterItems",
  siteNotes: "siteNotes",
  extractions: "extractions",
} as const;

export const REMINDER = {
  alarmPrefix: "readLaterAlarm:",
  notificationPrefix: "readLaterNotification:",
  snoozeMs: 30 * 60 * 1000,
} as const;
