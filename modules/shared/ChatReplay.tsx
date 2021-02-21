import React from "react";
import { ChatMessage } from "./database";

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
  const [messages, setMessages] = React.useState([]);

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
      {currentTimeSeconds}
      {messages.map((msg) => (
        <p>{msg.message}</p>
      ))}
    </div>
  );
};

export default ChatReplay;
