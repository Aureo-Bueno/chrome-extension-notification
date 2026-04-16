export interface ReadLaterItem {
  id: string;
  url: string;
  title: string;
  createdAt: number;
  remindAt?: number;
}

export interface SiteNoteEntry {
  note: string;
  updatedAt: number;
}

export interface ExtractedLink {
  text: string;
  href: string;
}

export interface ExtractionEntry {
  id: string;
  url: string;
  title: string;
  createdAt: number;
  headings: string[];
  links: ExtractedLink[];
  excerpt: string;
  markdown: string;
  json: string;
}

export interface SaveReadLaterPayload {
  url: string;
  title: string;
  remindAt?: number;
}

export interface ItemIdPayload {
  id: string;
}

export interface SiteNotePayload {
  domain: string;
  note: string;
}

export interface SiteNoteDomainPayload {
  domain: string;
}

export interface ExtractPagePayload {
  tabId: number;
}

export type RuntimeMessage =
  | { type: "get-read-later" }
  | { type: "save-read-later"; payload: SaveReadLaterPayload }
  | { type: "delete-read-later"; payload: ItemIdPayload }
  | { type: "open-read-later"; payload: ItemIdPayload }
  | { type: "get-site-note"; payload: SiteNoteDomainPayload }
  | { type: "save-site-note"; payload: SiteNotePayload }
  | { type: "get-extractions" }
  | { type: "extract-page"; payload: ExtractPagePayload }
  | { type: "test-notification" };

export interface RuntimeResponse {
  ok: boolean;
  error?: string;
  readLaterItems?: ReadLaterItem[];
  note?: string;
  extractions?: ExtractionEntry[];
  extraction?: ExtractionEntry;
}
