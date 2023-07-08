import { ChatReplayParser } from '.';
import { ChatMessage } from '../../database.d';

export default class DefaultChatParser implements ChatReplayParser {
  name: 'DefaultChatParser';
  chatData: string = '';

  constructor(chatData: string) {
    this.chatData = chatData.trim();
  }

  canParse(): boolean {
    return this.chatData.startsWith('[') && this.chatData.endsWith(']');
  }

  parse(): ChatMessage[] {
    return (JSON.parse(this.chatData) as ChatMessage[]).sort(
      (a, b) => a.time_in_seconds - b.time_in_seconds
    );
  }
}
