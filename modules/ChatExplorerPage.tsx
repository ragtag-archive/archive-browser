import React from "react";
import Head from "next/head";
import axios from "axios";
import PageBase from "./shared/PageBase";
import {
  ChatMessage,
  ChatMessageType,
  ChatMessageTypes,
} from "./shared/database.d";
import ServiceUnavailablePage from "./ServiceUnavailablePage";
import ChatMessageRender from "./shared/ChatReplay/ChatMessageRender";
import { buttonStyle } from "./shared/VideoActionButtons";

type ChatExplorerPageProps = {
  chatURL?: string;
  v?: string;
};

const inputStyle = `
  w-full rounded px-4 py-1 mb-4
  bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring
  transition duration-100`.replace(/\s+/g, " ");

const ChatExplorerPage = (props: ChatExplorerPageProps) => {
  if (!props.v || !props.chatURL) return <ServiceUnavailablePage />;
  const [replayData, setReplayData] = React.useState<ChatMessage[]>(null);
  const [displayedMessages, setDisplayedMessages] = React.useState<
    ChatMessage[]
  >([]);
  const [downloadProgress, setDownloadProgress] = React.useState(-1);
  const [isErrored, setIsErrored] = React.useState(false);

  // Filters
  const [startIndex, setStartIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(50);
  const [messageTypes, setMessageTypes] = React.useState<ChatMessageType[]>([
    ...ChatMessageTypes,
  ]);

  const applyFilters = () => {
    const filteredMessages: ChatMessage[] = [];
    for (let i = 0; i < replayData.length; i++) {
      const message = replayData[i];
      if (messageTypes.includes(message.message_type))
        filteredMessages.push(message);

      if (filteredMessages.length >= startIndex + pageSize) break;
    }
    setDisplayedMessages(filteredMessages.slice(startIndex));
  };

  const toggleMessageType = (type: ChatMessageType) => {
    setMessageTypes((now) =>
      now.includes(type)
        ? now.filter((_type) => _type !== type)
        : [type, ...now]
    );
  };

  const downloadChat = async () => {
    setDownloadProgress(0);
    setReplayData(null);
    setIsErrored(false);
    try {
      const data = await axios.get<ChatMessage[]>(props.chatURL, {
        onDownloadProgress: (progressEvent) => {
          setDownloadProgress(progressEvent.loaded);
        },
      });

      setReplayData(data.data);
    } catch (ex) {
      console.error(ex);
      setIsErrored(true);
    }
  };

  React.useEffect(() => {
    downloadChat();
  }, []);

  React.useEffect(() => {
    if (replayData) applyFilters();
  }, [replayData]);

  return (
    <PageBase flex>
      <Head>
        <title>Chat Explorer - Ragtag Archive</title>
      </Head>
      {!replayData ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-2xl text-center">
            {isErrored ? (
              <>Error downloading chat</>
            ) : (
              <>
                Loading chat...
                <br />
                {(downloadProgress / 1024 / 1024).toFixed(2)} MB
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 self-center w-full max-w-screen-lg">
          <div className="flex flex-col flex-1 px-2">
            <h1 className="text-2xl pb-4">Chat explorer</h1>
            <div>
              <div className="flex">
                <label className="pr-1">
                  <span>Start message number</span>
                  <input
                    type="number"
                    className={inputStyle}
                    value={startIndex}
                    onChange={(e) =>
                      setStartIndex(
                        Math.min(
                          replayData.length,
                          Math.max(0, Number(e.target.value))
                        )
                      )
                    }
                  />
                </label>
                <label className="pl-1">
                  <span>Number of messages to show</span>
                  <input
                    type="number"
                    className={inputStyle}
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="flex flex-col">
                <div>Message type</div>
                {([
                  ["text_message", "Text message"],
                  ["paid_message", "Superchat"],
                  ["membership_item", "Membership"],
                ] as Array<[ChatMessageType, string]>).map(
                  ([messageType, label]) => (
                    <label key={messageType}>
                      <input
                        type="checkbox"
                        checked={messageTypes.includes(messageType)}
                        onChange={() => toggleMessageType(messageType)}
                      />{" "}
                      {label}
                    </label>
                  )
                )}
              </div>
              <button
                type="button"
                className={[buttonStyle, "mt-2"].join(" ")}
                onClick={applyFilters}
              >
                Apply filters
              </button>
            </div>
          </div>
          <div className="flex flex-col flex-1 relative">
            <div className="absolute h-full w-full overflow-y-scroll">
              {displayedMessages.map((msg) => (
                <ChatMessageRender key={msg.message_id} message={msg} />
              ))}
            </div>
          </div>
        </div>
      )}
    </PageBase>
  );
};

export default ChatExplorerPage;
