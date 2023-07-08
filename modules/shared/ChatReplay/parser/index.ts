import { ChatMessage } from '../../database.d';
import DefaultChatParser from './default';
import YtDlpChatParser from './yt-dlp';

export abstract class ChatReplayParser {
  name: string = '';

  constructor(chatData: string) {
    if (this.constructor === ChatReplayParser)
      throw new Error("Abstract classes can't be instantiated.");
  }

  canParse(): boolean {
    return false;
  }

  parse(): ChatMessage[] {
    return [];
  }
}

export const parseChatReplay = (input: string) => {
  console.log('[chat] parsing chat data');
  const parser = [DefaultChatParser, YtDlpChatParser]
    .map((Parser) => new Parser(input))
    .find((parser) => parser.canParse());
  if (!parser) throw new Error('No suitable chat parser found');
  console.log('[chat] using', parser.name);
  const parsed = parser.parse();
  console.log('[chat] found', parsed.length, 'messages');
  return parsed;
};
