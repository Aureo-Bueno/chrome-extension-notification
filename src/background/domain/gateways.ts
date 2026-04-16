import type {
  ExtractedLink,
  ReadLaterItem,
  SiteNoteEntry,
} from "../../shared/contracts/messages.js";

export interface StorageGateway {
  get<T>(key: string, fallback: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
}

export interface TabsGateway {
  getById(tabId: number): Promise<chrome.tabs.Tab>;
  open(url: string): Promise<void>;
}

export interface PageExtractorGateway {
  extract(tabId: number): Promise<{
    headings: string[];
    links: ExtractedLink[];
    excerpt: string;
  }>;
}

export interface AlarmsGateway {
  create(name: string, when: number): Promise<void>;
  clear(name: string): Promise<void>;
}

export interface NotificationsGateway {
  create(
    notificationId: string,
    options: chrome.notifications.NotificationCreateOptions
  ): Promise<void>;
  clear(notificationId: string): Promise<void>;
}

export interface ReadLaterRepositoryContract {
  getAll(): Promise<ReadLaterItem[]>;
  saveAll(items: ReadLaterItem[]): Promise<void>;
}

export interface SiteNoteRepositoryContract {
  getAll(): Promise<Record<string, SiteNoteEntry>>;
  saveAll(notes: Record<string, SiteNoteEntry>): Promise<void>;
}

export interface ExtractionRepositoryContract {
  getAll(): Promise<
    {
      id: string;
      url: string;
      title: string;
      createdAt: number;
      headings: string[];
      links: ExtractedLink[];
      excerpt: string;
      markdown: string;
      json: string;
    }[]
  >;
  saveAll(
    extractions: {
      id: string;
      url: string;
      title: string;
      createdAt: number;
      headings: string[];
      links: ExtractedLink[];
      excerpt: string;
      markdown: string;
      json: string;
    }[]
  ): Promise<void>;
}
