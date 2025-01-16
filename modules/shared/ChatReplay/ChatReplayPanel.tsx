import React from 'react';
import axios from 'axios';
import { ChatMessage } from '../database.d';
import ChatReplay from './ChatReplay';
import { IconChevronDown, IconFilter, IconBars, IconTachometerAlt } from '../icons';
import { useDebounce } from '../hooks/useDebounce';
import { parseChatReplay } from './parser';
import useLocalStorageState from 'use-local-storage-state';

export type ChatReplayPanelProps = {
  src: string;
  info?: string;
  currentTimeSeconds: number;
};

const ChatReplayPanel = (props: ChatReplayPanelProps) => {
  const [replayData, setReplayData] = React.useState<ChatMessage[]>(null);
  const [filteredReplayData, setFilteredReplayData] =
    React.useState<ChatMessage[]>(null);
  const [downloadProgress, setDownloadProgress] = React.useState(-1);
  const [isFilterVisible, setIsFilterVisible] = React.useState(false);
  const [chatFilter, setChatFilter] = React.useState('');
  const [isChatVisible, setIsChatVisible] = useLocalStorageState('chat:visible', { defaultValue: true });
  const [isChatSmooth, setIsChatSmooth] = useLocalStorageState('chat:smooth', { defaultValue: true });
  const [isHeaderVisible, setIsHeaderVisible] = useLocalStorageState('header:visible', { defaultValue: true });
  const [isErrored, setIsErrored] = React.useState(false);
  const refChatScrollDiv = React.useRef<HTMLDivElement>(null);

  const activeChatFilter = useDebounce(chatFilter, 250);

  const downloadChatData = async () => {
    setDownloadProgress(0);
    setReplayData(null);
    setIsErrored(false);
    try {
      const data = await axios.get(props.src, {
        onDownloadProgress: ({ loaded }) => setDownloadProgress(loaded),
        transformResponse: (res) => res,
      });

      const info: any = props.info ? await axios.get(props.info, {
        transformResponse: (res) => res,
      }) : {};

      setReplayData(parseChatReplay(data.data, info.data));
    } catch (ex) {
      console.log('[chat] error parsing chat:', ex);
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
        behavior: isChatSmooth ? 'smooth' : 'instant',
      });
  }, [props.currentTimeSeconds]);

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
          <div className="flex-1 flex items-center px-2">Chat replay</div>
          <div>
            <button
              type="button"
              title={isHeaderVisible ? 'Hide header' : 'Show header'}
              onClick={() => setIsHeaderVisible((now) => !now)}
              className="px-2 py-2"
              style={{
                transitionDuration: '0.3s',
                transitionProperty: 'transform',
                transform: isHeaderVisible ? 'none' : 'rotate(90deg)'
              }}
            >
              <IconBars width="1.1em" height="1.1em" />
            </button>

            <button
              type="button"
              title={isChatSmooth ? 'Smooth scroll' : 'Instant scroll'}
              onClick={() => setIsChatSmooth((now) => !now)}
              className="px-2 py-2"
              style={{
                transform: isChatSmooth ? 'scaleX(-1)' : 'none'
              }}
            >
              <IconTachometerAlt width="1.2em" height="1.2em" />
            </button>

            <button
              type="button"
              title="Filter text"
              onClick={() => setIsFilterVisible((now) => !now)}
              className="px-2 py-2"
            >
              <IconFilter width="1em" height="1em" />
            </button>

            <button
              type="button"
              title={isChatVisible ? 'Collapse chat' : 'Expand chat'}
              onClick={() => setIsChatVisible((now) => !now)}
              className="text-lg px-3 py-2"
            >
              <IconChevronDown
                width="1em"
                height="1em"
                style={{
                  transitionDuration: '0.3s',
                  transitionProperty: 'transform',
                  transform: isChatVisible ? 'scaleY(-1)' : 'none'
                }}
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
              'px-2 border border-gray-800 rounded',
              'overflow-hidden hover:overflow-y-scroll absolute inset-0',
              'transition-all duration-200',
            ].join(' ')}
            style={{
              overscrollBehavior: 'contain',
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
