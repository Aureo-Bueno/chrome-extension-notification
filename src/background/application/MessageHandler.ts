import type {
  RuntimeMessage,
  RuntimeResponse,
} from "../../shared/contracts/messages.js";
import { ExtractionService } from "../services/ExtractionService.js";
import { NotificationService } from "../services/NotificationService.js";
import { ReadLaterService } from "../services/ReadLaterService.js";
import { SiteNoteService } from "../services/SiteNoteService.js";

/**
 * Application service that maps runtime messages to use-case methods.
 */
export class MessageHandler {
  constructor(
    private readonly readLater: ReadLaterService,
    private readonly siteNotes: SiteNoteService,
    private readonly extractions: ExtractionService,
    private readonly notifications: NotificationService
  ) {}

  /**
   * Processes a runtime message and returns a normalized response payload.
   */
  async handle(message: RuntimeMessage): Promise<RuntimeResponse> {
    switch (message.type) {
      case "get-read-later": {
        const readLaterItems = await this.readLater.getAll();
        return { ok: true, readLaterItems };
      }

      case "save-read-later": {
        const readLaterItems = await this.readLater.save(message.payload);
        return { ok: true, readLaterItems };
      }

      case "delete-read-later": {
        const readLaterItems = await this.readLater.delete(message.payload.id);
        return { ok: true, readLaterItems };
      }

      case "open-read-later": {
        await this.readLater.open(message.payload.id);
        return { ok: true };
      }

      case "get-site-note": {
        const note = await this.siteNotes.get(message.payload.domain);
        return { ok: true, note };
      }

      case "save-site-note": {
        await this.siteNotes.save(message.payload.domain, message.payload.note);
        return { ok: true };
      }

      case "get-extractions": {
        const extractions = await this.extractions.getAll();
        return { ok: true, extractions };
      }

      case "extract-page": {
        const extraction = await this.extractions.extract(message.payload.tabId);
        return { ok: true, extraction };
      }

      case "test-notification": {
        await this.notifications.showTestNotification();
        return { ok: true };
      }

      default:
        return { ok: false, error: "Unknown message type." };
    }
  }
}
