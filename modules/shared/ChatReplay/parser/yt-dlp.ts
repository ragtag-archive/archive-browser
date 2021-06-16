import { ChatReplayParser } from ".";
import {
  ChatMessage,
  ChatMessageAuthor,
  ChatMessageImage,
} from "../../database.d";

export default class YtDlpChatParser implements ChatReplayParser {
  name = "YtDlpChatParser";
  chatData: string = "";

  constructor(chatData: string) {
    this.chatData = chatData.trim();
  }

  canParse(): boolean {
    return (
      this.chatData.startsWith("{") &&
      this.chatData.endsWith("}") &&
      this.chatData.includes("\n") &&
      this.chatData.includes("clickTrackingParams")
    );
  }

  parse(): ChatMessage[] {
    return this.chatData
      .split("\n")
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (ex) {
          return null;
        }
      })
      .filter(Boolean)
      .map((event) => {
        const actionBase = event.replayChatItemAction.actions[0];
        const action_type =
          "addChatItemAction" in actionBase
            ? "add_chat_item"
            : "addLiveChatTickerItemAction" in actionBase
            ? "add_live_chat_ticker_item"
            : "unknown";

        // Skip handling tickers for now
        if (action_type !== "add_chat_item") return null;

        const actionItem = actionBase.addChatItemAction.item;
        const message_type =
          "liveChatMembershipItemRenderer" in actionItem
            ? "membership_item"
            : "liveChatTextMessageRenderer" in actionItem
            ? "text_message"
            : "liveChatPaidMessageRenderer" in actionItem
            ? "paid_message"
            : "unknown";

        if (message_type === "unknown") return null;

        const messageItem =
          actionItem.liveChatMembershipItemRenderer ||
          actionItem.liveChatTextMessageRenderer ||
          actionItem.liveChatPaidMessageRenderer;

        if (!messageItem) return null;

        const author: ChatMessageAuthor & {
          name_text_colour?: string;
        } = {
          name: messageItem.authorName.simpleText,
          id: messageItem.authorExternalChannelId,
          images: messageItem.authorPhoto?.thumbnails.map(
            (thumb: Partial<ChatMessageImage>) => ({
              id: String(thumb.height),
              ...thumb,
            })
          ),
          badges: messageItem.authorBadges?.map(
            ({ liveChatAuthorBadgeRenderer: badge }: any) => ({
              title: badge.tooltip,
              icons: badge.customThumbnail?.thumbnails,
            })
          ),
          name_text_colour:
            "#" + messageItem.authorNameTextColor?.toString(16).substr(2),
        };

        return {
          time_in_seconds:
            event.replayChatItemAction.videoOffsetTimeMsec / 1000,
          action_type,
          message_type,
          author,
          message_id: messageItem.id,
          timestamp: Number(messageItem.timestampUsec),
          time_text: messageItem.timestampText.simpleText,
          message:
            messageItem.message || messageItem.headerSubtext
              ? (messageItem.message || messageItem.headerSubtext).runs
                  .map((run: any) =>
                    run.emoji ? run.emoji.shortcuts[0] : run.text
                  )
                  .join("")
              : "",
          emotes: messageItem.message?.runs
            .map((run: any) => run.emoji)
            .filter(Boolean)
            .map((e: any) => ({
              id: e.emojiId,
              name: e.shortcuts[0],
              shortcuts: e.shortcuts,
              search_terms: e.searchTerms,
              is_custom_emoji: e.isCustomEmoji,
              images: e.image?.thumbnails.map(
                (thumb: Partial<ChatMessageImage>) => ({
                  id: String(thumb.height),
                  ...thumb,
                })
              ),
            })),
          ...(message_type === "paid_message"
            ? {
                money: {
                  text: messageItem.purchaseAmountText.simpleText,
                  amount: 0,
                  currency: "-",
                  currency_symbol: "-",
                },
                timestamp_colour:
                  "#" + messageItem.timestampColor?.toString(16).substr(2),
                body_background_colour:
                  "#" + messageItem.bodyBackgroundColor?.toString(16).substr(2),
                header_text_colour:
                  "#" + messageItem.headerTextColor?.toString(16).substr(2),
                header_background_colour:
                  "#" +
                  messageItem.headerBackgroundColor?.toString(16).substr(2),
                body_text_colour:
                  "#" + messageItem.bodyTextColor?.toString(16).substr(2),
              }
            : {}),
        };
      })
      .filter(Boolean) as ChatMessage[];
  }
}
