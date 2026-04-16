import type {
  RuntimeMessage,
  RuntimeResponse,
} from "../../shared/contracts/messages.js";

export class RuntimeClient {
  async send(message: RuntimeMessage): Promise<RuntimeResponse> {
    return (await chrome.runtime.sendMessage(message)) as RuntimeResponse;
  }
}
