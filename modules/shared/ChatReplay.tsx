import React from "react";
import { ChatMessage } from "./database.d";
import { formatSeconds } from "./format";

export type ChatReplayProps = {
  replayData: ChatMessage[];
  currentTimeSeconds: number;
};

function bsearch<T>(
  arr: T[],
  search: number,
  transform: (item: T) => number
): number {
  let iL = 0,
    iR = arr.length - 1,
    iM = Math.floor(arr.length / 2);

  while (iR - iL > 1) {
    iM = Math.floor((iL + iR) / 2);
    const m = transform(arr[iM]);

    if (m < search) iL = iM;
    else if (m > search) iR = iM;
    else if (m === search || iL === iM) return iM;
  }
  return iM;
}

const proxyHost = "archive-yt3-ggpht-proxy.ragtag.moe";

const ChatReplay = (props: ChatReplayProps) => {
  const { replayData, currentTimeSeconds } = props;
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  React.useEffect(() => {
    /**
     * Find the current replayData index where
     * time_in_seconds <= currentTimeSeconds
     * using binary search
     */
    const index = bsearch(
      replayData,
      currentTimeSeconds,
      (message) => message.time_in_seconds
    );

    /**
     * Once index is acquired, slice the array
     * to get the previous `maxMessages` items
     */
    const maxMessages = 50;
    setMessages(replayData.slice(Math.max(0, index - maxMessages), index));
  }, [replayData, currentTimeSeconds]);

  const proxyURL = (url: string): string => {
    const u = new URL(url);
    u.hostname = proxyHost;
    return u.toString();
  };

  return (
    <div className="w-full break-words">
      {messages.map((msg) => {
        switch (msg.message_type) {
          case "paid_message":
            return (
              <div
                key={msg.message_id}
                className="my-4 rounded overflow-hidden"
                style={{
                  color: msg.body_text_colour,
                  background: msg.body_background_colour,
                }}
              >
                <div
                  style={{
                    color: msg.header_text_colour,
                    background: msg.header_background_colour,
                  }}
                  className="flex flex-row justify-between px-4 py-2"
                >
                  <div>
                    <div style={{ color: msg.author.name_text_colour }}>
                      {msg.author.name}
                      {msg.author.badges && msg.author.badges[0].icons ? (
                        <img
                          src={proxyURL(msg.author.badges[0].icons[1].url)}
                          className="inline-block ml-2"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <div className="font-bold">{msg.money.text}</div>
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: msg.author.name_text_colour }}
                  >
                    [{formatSeconds(msg.time_in_seconds)}]
                  </div>
                </div>
                <div className="px-4 py-2">{msg.message}</div>
              </div>
            );
          case "membership_item":
            return (
              <div
                key={msg.message_id}
                className="px-4 py-2 my-4 rounded bg-green-600 text-white"
              >
                <div className="flex flex-row justify-between pb-2">
                  <div className="font-bold">
                    <div className="inline-block">{msg.author.name}</div>
                    {msg.author.badges && msg.author.badges[0].icons ? (
                      <img
                        src={proxyURL(msg.author.badges[0].icons[1].url)}
                        className="inline-block ml-2"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <div className="text-sm">
                    [{formatSeconds(msg.time_in_seconds)}]
                  </div>
                </div>
                {msg.message}
              </div>
            );
          case "text_message":
            const authorType =
              msg.author.badges?.map(({ title }) =>
                title === "Owner"
                  ? "owner"
                  : title === "Moderator"
                  ? "moderator"
                  : title.toLowerCase().includes("member")
                  ? "member"
                  : ""
              ) || [];
            return (
              <div key={msg.message_id} className="px-2 mb-2">
                <div className="text-gray-400 text-xs flex justify-between">
                  <span
                    className={[
                      "mr-2",
                      authorType.includes("owner")
                        ? "bg-blue-600 text-white font-bold px-2 rounded"
                        : authorType.includes("moderator")
                        ? "text-blue-600 font-bold"
                        : authorType.includes("member")
                        ? "text-green-500"
                        : "",
                    ].join(" ")}
                  >
                    {msg.author.name}
                    {authorType.includes("moderator") && (
                      <svg
                        viewBox="0 0 16 16"
                        className="text-blue-600 w-4 h-4 inline-block ml-2"
                      >
                        <path
                          fill="currentColor"
                          d="M9.64589146,7.05569719 C9.83346524,6.562372 9.93617022,6.02722257 9.93617022,5.46808511 C9.93617022,3.00042984 7.93574038,1 5.46808511,1 C4.90894765,1 4.37379823,1.10270499 3.88047304,1.29027875 L6.95744681,4.36725249 L4.36725255,6.95744681 L1.29027875,3.88047305 C1.10270498,4.37379824 1,4.90894766 1,5.46808511 C1,7.93574038 3.00042984,9.93617022 5.46808511,9.93617022 C6.02722256,9.93617022 6.56237198,9.83346524 7.05569716,9.64589147 L12.4098057,15 L15,12.4098057 L9.64589146,7.05569719 Z"
                        />
                      </svg>
                    )}
                    {msg.author.badges?.map((badge) =>
                      Array.isArray(badge.icons) ? (
                        <img
                          key={badge.title}
                          src={proxyURL(badge.icons?.[1]?.url)}
                          className="inline-block ml-2"
                          aria-hidden
                        />
                      ) : null
                    )}
                  </span>
                  <span>[{formatSeconds(msg.time_in_seconds)}]</span>
                </div>
                {msg.message}
              </div>
            );
        }
      })}
    </div>
  );
};

export default ChatReplay;
