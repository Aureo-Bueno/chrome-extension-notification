import { BackgroundApp } from "./application/BackgroundApp.js";
import { MessageHandler } from "./application/MessageHandler.js";
import { ChromeAlarmsGateway } from "./infrastructure/ChromeAlarmsGateway.js";
import { ChromeNotificationsGateway } from "./infrastructure/ChromeNotificationsGateway.js";
import { ChromePageExtractorGateway } from "./infrastructure/ChromePageExtractorGateway.js";
import { ChromeStorageGateway } from "./infrastructure/ChromeStorageGateway.js";
import { ChromeTabsGateway } from "./infrastructure/ChromeTabsGateway.js";
import { ExtractionRepository } from "./repositories/ExtractionRepository.js";
import { ReadLaterRepository } from "./repositories/ReadLaterRepository.js";
import { SiteNoteRepository } from "./repositories/SiteNoteRepository.js";
import { ExtractionService } from "./services/ExtractionService.js";
import { IdService } from "./services/IdService.js";
import { NotificationService } from "./services/NotificationService.js";
import { ReadLaterService } from "./services/ReadLaterService.js";
import { ReminderIdentityService } from "./services/ReminderIdentityService.js";
import { SiteNoteService } from "./services/SiteNoteService.js";
import { TabPolicyService } from "./services/TabPolicyService.js";

const storage = new ChromeStorageGateway();
const tabs = new ChromeTabsGateway();
const extractor = new ChromePageExtractorGateway();
const alarms = new ChromeAlarmsGateway();
const notificationsGateway = new ChromeNotificationsGateway();

const readLaterRepository = new ReadLaterRepository(storage);
const siteNoteRepository = new SiteNoteRepository(storage);
const extractionRepository = new ExtractionRepository(storage);

const ids = new IdService();
const reminderIdentity = new ReminderIdentityService();
const tabPolicy = new TabPolicyService();

const readLaterService = new ReadLaterService(
  readLaterRepository,
  tabs,
  alarms,
  reminderIdentity,
  ids
);
const siteNoteService = new SiteNoteService(siteNoteRepository);
const extractionService = new ExtractionService(
  extractionRepository,
  tabs,
  extractor,
  tabPolicy,
  ids
);
const notificationService = new NotificationService(
  notificationsGateway,
  alarms,
  readLaterService,
  reminderIdentity
);

const messageHandler = new MessageHandler(
  readLaterService,
  siteNoteService,
  extractionService,
  notificationService
);

const app = new BackgroundApp(messageHandler, notificationService);
app.start();
