import React from "react";
import axios from "axios";
import {
  ChatMessage,
  ChatMessageAuthor,
  ChatMessageEmote,
  ChatMessageImage,
} from "../database.d";
import ChatReplay from "./ChatReplay";
import { IconChevronDown, IconFilter } from "../icons";
import { useDebounce } from "../hooks/useDebounce";

export type ChatReplayPanelProps = {
  src: string;
  currentTimeSeconds: number;
  onChatToggle?: (isVisible: boolean) => any;
};

const ChatReplayPanel = (props: ChatReplayPanelProps) => {
  const [replayData, setReplayData] = React.useState<ChatMessage[]>(null);
  const [filteredReplayData, setFilteredReplayData] =
    React.useState<ChatMessage[]>(null);
  const [downloadProgress, setDownloadProgress] = React.useState(-1);
  const [isFilterVisible, setIsFilterVisible] = React.useState(false);
  const [chatFilter, setChatFilter] = React.useState("");
  const [isChatVisible, setIsChatVisible] = React.useState(false);
  const [isErrored, setIsErrored] = React.useState(false);
  const refChatScrollDiv = React.useRef<HTMLDivElement>(null);

  const activeChatFilter = useDebounce(chatFilter, 250);

  const downloadChatData = async () => {
    setDownloadProgress(0);
    setReplayData(null);
    setIsErrored(false);
    try {
      const data = await axios.get(props.src, {
        onDownloadProgress: (progressEvent) => {
          setDownloadProgress(progressEvent.loaded);
        },
      });

      let _replayData: ChatMessage[] = data.data;

      // Check chat format
      if (typeof data.data === "string" && data.data.startsWith("[")) {
        // JSON array, assume format matches `ChatMessage[]`
        console.log("[chat] Attempting to parse as JSON");
        _replayData = JSON.parse(data.data);
      } else if (
        typeof data.data === "string" &&
        data.data.startsWith("{") &&
        data.data.includes("\n")
      ) {
        console.log("[chat] Attempting to parse as NDJSON (yt-dlp)");
        // probably ndjson, probably from yt-dlp
        _replayData = data.data
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line))
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
                .map((e) => ({
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
                      "#" +
                      messageItem.bodyBackgroundColor?.toString(16).substr(2),
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
          .filter(Boolean);
      }

      console.log("[chat] found", _replayData.length, "messages");
      console.log(_replayData);
      setReplayData(_replayData);
      setIsChatVisible(true);
    } catch (ex) {
      console.log("[chat] error parsing chat", ex);
      setIsErrored(true);
    }
  };

  React.useEffect(() => {
    if (!replayData) return;
    if (!activeChatFilter) return setFilteredReplayData(replayData);

    setFilteredReplayData(
      replayData.filter(
        (message) =>
          !!message.message &&
          message.message.toLowerCase().includes(activeChatFilter.toLowerCase())
      )
    );
  }, [activeChatFilter, replayData]);

  /**
   * Automatically download chat replay
   */
  React.useEffect(() => {
    downloadChatData();
  }, [props.src]);

  React.useEffect(() => {
    if (refChatScrollDiv.current)
      refChatScrollDiv.current.scrollTo({
        top: refChatScrollDiv.current.scrollHeight,
        behavior: "smooth",
      });
  }, [props.currentTimeSeconds]);

  React.useEffect(() => {
    props.onChatToggle?.(isChatVisible);
  }, [isChatVisible]);

  if (replayData === null)
    return (
      <div
        className="border border-gray-800 rounded p-4 text-center cursor-pointer"
        onClick={() => {
          if (isErrored || downloadProgress < 0) downloadChatData();
        }}
      >
        {isErrored ? (
          <p>Error loading chat, click to retry</p>
        ) : downloadProgress < 0 ? (
          <>
            <p>Chat replay available!</p>
            <p>Click to Enable</p>
          </>
        ) : downloadProgress === 0 ? (
          <p>Loading chat replay...</p>
        ) : (
          <p>Loaded {(downloadProgress / 1024 / 1024).toFixed(2)}MB</p>
        )}
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col text-white bg-gray-900">
        <div className="flex">
          <div className="flex-1 flex items-center px-4">Chat replay</div>
          <div>
            <button
              type="button"
              onClick={() => setIsFilterVisible((now) => !now)}
              className="px-4 py-2"
            >
              <IconFilter width="1em" height="1em" />
            </button>
            <button
              type="button"
              onClick={() => setIsChatVisible((now) => !now)}
              className="text-lg px-4 py-2"
            >
              <IconChevronDown
                width="1em"
                height="1em"
                style={{ transform: isChatVisible ? "rotate(180deg)" : "" }}
              />
            </button>
          </div>
        </div>
        {isFilterVisible && (
          <div className="flex flex-col">
            <div className="flex">
              <input
                type="text"
                placeholder="Filter text"
                className="
                  w-full rounded px-4 py-1 md:mx-2
                  bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring
                  transition duration-100 z-20
                "
                value={chatFilter}
                onChange={(e) => setChatFilter(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      {isChatVisible && (
        <div className="relative flex-1">
          <div
            className={[
              "px-2 border border-gray-800 rounded",
              "overflow-y-scroll absolute inset-0",
              "transition-all duration-200",
            ].join(" ")}
            style={{
              overscrollBehavior: "contain",
            }}
            ref={refChatScrollDiv}
          >
            <ChatReplay
              currentTimeSeconds={props.currentTimeSeconds}
              replayData={filteredReplayData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatReplayPanel;
