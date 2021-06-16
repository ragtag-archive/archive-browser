import { ChatReplayParser } from ".";
import { ChatMessage } from "../../database.d";

export default class DefaultChatParser implements ChatReplayParser {
  chatData: string = "";

  constructor(chatData: string) {
    this.chatData = chatData.trim();
  }

  canParse(): boolean {
    return this.chatData.startsWith("[") && this.chatData.endsWith("]");
  }

  parse(): ChatMessage[] {
    return JSON.parse(this.chatData);
  }
}
