import React from "react";
import { ChatMessage } from "./database";
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

  return (
    <div className="w-full break-words">
      {messages.map((msg) => {
        switch (msg.message_type) {
          case "paid_message":
            return (
              <div
                key={msg.message_id}
                className="py-2 px-4 my-4 rounded"
                style={{
                  color: msg.body_text_colour,
                  background: msg.body_background_colour,
                }}
              >
                <div
                  style={{
                    color: msg.header_text_colour,
                    background: msg.body_background_colour,
                  }}
                  className="flex flex-row justify-between pb-2"
                >
                  <div className="font-bold">
                    <div>{msg.author.name}</div>
                    <div>{msg.money.text}</div>
                  </div>
                  <div className="text-sm">
                    [{formatSeconds(msg.time_in_seconds)}]
                  </div>
                </div>
                {msg.message}
              </div>
            );
          case "membership_item":
            return (
              <div
                key={msg.message_id}
                className="px-4 py-2 my-4 rounded bg-green-500 text-white"
              >
                <div className="flex flex-row justify-between pb-2">
                  <div className="font-bold">
                    <div>{msg.author.name}</div>
                  </div>
                  <div className="text-sm">
                    [{formatSeconds(msg.time_in_seconds)}]
                  </div>
                </div>
                {msg.message}
              </div>
            );
          case "text_message":
            return (
              <div key={msg.message_id} className="px-2 mb-2">
                <div className="text-gray-400 text-xs">
                  [{formatSeconds(msg.time_in_seconds)}]
                  <span className="ml-2">{msg.author.name}</span>
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
