import { ChatReplayParser } from '.';
import { ChatMessage } from '../../database.d';

export default class DefaultChatParser implements ChatReplayParser {
  name: 'DefaultChatParser';
  chatData: string = '';
  videoInfo: string = '';

  constructor(chatData: string, videoInfo: string) {
    this.chatData = chatData.trim();
    this.videoInfo = videoInfo.trim();
  }

  canParse(): boolean {
    return (
      this.chatData.startsWith('[') &&
      this.chatData.endsWith(']') && (
        this.chatData.includes('time_in_seconds') ||
        this.videoInfo.includes('release_timestamp')
      )
    );
  }

  parse(): ChatMessage[] {
    this.chatData = JSON.parse(this.chatData);

    // Handle live_chat.json without time_in_seconds values
    if (
      this.chatData.length > 0 &&
      !('time_in_seconds' in this.chatData[0])
    ) {
      this.videoInfo = JSON.parse(this.videoInfo);
      // Read stream start time from info.json (as seconds)
      const startTime = Number(this.videoInfo.release_timestamp);
      // Action times are microseconds
      this.chatData.forEach((action) =>
        action.time_in_seconds = (action.timestamp / 1000000) - startTime
      );
    }

    return this.chatData.sort((a, b) => a.time_in_seconds - b.time_in_seconds) as ChatMessage[];
  }
}
