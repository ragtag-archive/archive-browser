import React from "react";
import axios from "axios";
import { ChatMessage } from "../database.d";
import ChatReplay from "./ChatReplay";
import { IconChevronDown, IconFilter } from "../icons";

export type ChatReplayPanelProps = {
  src: string;
  currentTimeSeconds: number;
  onChatToggle?: (isVisible: boolean) => any;
};

const ChatReplayPanel = (props: ChatReplayPanelProps) => {
  const [replayData, setReplayData] = React.useState<ChatMessage[]>(null);
  const [downloadProgress, setDownloadProgress] = React.useState(-1);
  const [isFilterVisible, setIsFilterVisible] = React.useState(false);
  const [isChatVisible, setIsChatVisible] = React.useState(false);
  const [isErrored, setIsErrored] = React.useState(false);
  const refChatScrollDiv = React.useRef<HTMLDivElement>(null);

  const downloadChatData = async () => {
    setDownloadProgress(0);
    setReplayData(null);
    setIsErrored(false);
    try {
      const data = await axios.get<ChatMessage[]>(props.src, {
        onDownloadProgress: (progressEvent) => {
          setDownloadProgress(progressEvent.loaded);
        },
      });

      // Check if data is valid
      if (typeof data.data === "string") {
        JSON.parse(data.data);
      }

      setReplayData(data.data);
      setIsChatVisible(true);
    } catch (ex) {
      setIsErrored(true);
    }
  };

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
              />
            </div>
            <div className="flex">
              <div className="flex-1">
                <label>
                  <input type="checkbox" />
                  RegEx
                </label>
              </div>
              <button type="button">Filter</button>
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
              replayData={replayData}
            />
          </div>
        </div>
      )}
      {/*
      <button
        type="button"
        onClick={() => setIsChatVisible((now) => !now)}
        className="w-full py-2 text-center bg-gray-900 hover:bg-gray-800 focus:ring focus:outline-none rounded transition duration-200"
      >
        {isChatVisible ? "Hide chat replay" : "Show chat replay"}
      </button>*/}
    </div>
  );
};

export default ChatReplayPanel;
