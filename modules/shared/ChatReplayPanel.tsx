import React from "react";
import axios from "axios";
import { ChatMessage } from "./database";
import ChatReplay from "./ChatReplay";

export type ChatReplayPanelProps = {
  src: string;
  currentTimeSeconds: number;
};

const ChatReplayPanel = (props: ChatReplayPanelProps) => {
  const [replayData, setReplayData] = React.useState<ChatMessage[]>(null);
  const [downloadProgress, setDownloadProgress] = React.useState(-1);
  const [isChatVisible, setIsChatVisible] = React.useState(true);
  const refChatScrollDiv = React.useRef<HTMLDivElement>(null);

  const downloadChatData = async () => {
    setDownloadProgress(0);
    const data = await axios.get(props.src, {
      onDownloadProgress: (progressEvent) => {
        setDownloadProgress(progressEvent.loaded);
      },
    });
    setReplayData(data.data);
  };

  /**
   * Automatically download chat replay
   */
  React.useEffect(() => {
    downloadChatData();
  }, []);

  React.useEffect(() => {
    if (refChatScrollDiv.current)
      refChatScrollDiv.current.scrollTo({
        top: refChatScrollDiv.current.scrollHeight,
        behavior: "smooth",
      });
  }, [props.currentTimeSeconds]);

  if (replayData === null)
    return (
      <div
        className="border border-gray-800 rounded p-4 text-center cursor-pointer"
        onClick={() => {
          if (downloadProgress < 0) downloadChatData();
        }}
      >
        {downloadProgress < 0 ? (
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
    <div>
      <div
        className={
          "border border-gray-800 rounded overflow-y-scroll resize-y transition-all duration-200 " +
          (isChatVisible ? "h-96" : "h-8")
        }
        ref={refChatScrollDiv}
      >
        {isChatVisible ? (
          <ChatReplay
            currentTimeSeconds={props.currentTimeSeconds}
            replayData={replayData}
          />
        ) : (
          <div>Chat disabled</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setIsChatVisible((now) => !now)}
        className="w-full text-center bg-gray-900 hover:bg-gray-800 focus:ring focus:outline-none rounded transition duration-200"
      >
        Toggle chat
      </button>
    </div>
  );
};

export default ChatReplayPanel;
