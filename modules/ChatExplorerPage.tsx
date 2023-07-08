import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import axios from 'axios';
import PageBase from './shared/PageBase';
import {
  ChatMessage,
  ChatMessageType,
  ChatMessageTypes,
} from './shared/database.d';
import ServiceUnavailablePage from './ServiceUnavailablePage';
import ChatMessageRender from './shared/ChatReplay/ChatMessageRender';
import { buttonStyle } from './shared/VideoActionButtons';
import { formatNumber } from './shared/format';
import { NextImage } from './shared/NextImage';

type ChatExplorerPageProps = {
  chatURL?: string;
  thumbnailURL?: string;
  title?: string;
  v?: string;
};

const inputStyle = `
  w-full rounded px-4 py-1
  bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring
  transition duration-100`.replace(/\s+/g, ' ');

const ChatExplorerPage = (props: ChatExplorerPageProps) => {
  if (!props.v || !props.chatURL) return <ServiceUnavailablePage />;
  const [replayData, setReplayData] = React.useState<ChatMessage[]>(null);
  const [downloadProgress, setDownloadProgress] = React.useState(-1);
  const [isErrored, setIsErrored] = React.useState(false);

  // Displayed data
  const [filteredMessages, setFilteredMessages] = React.useState<ChatMessage[]>(
    []
  );
  const [totalEarnings, setTotalEarnings] = React.useState<{
    [key: string]: number;
  }>({});

  // Filters
  const [startIndex, setStartIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(50);
  const [messageTypes, setMessageTypes] = React.useState<ChatMessageType[]>([
    ...ChatMessageTypes,
  ]);

  const applyFilters = () => {
    const matching: ChatMessage[] = [];
    const earnings: { [currency: string]: number } = {};
    for (let i = 0; i < replayData.length; i++) {
      const message = replayData[i];
      if (messageTypes.includes(message.message_type)) {
        matching.push(message);
        if (message.message_type === 'paid_message') {
          if (typeof earnings[message.money.currency] !== 'number')
            earnings[message.money.currency] = 0;
          earnings[message.money.currency] += message.money.amount;
        }
      }
    }
    setFilteredMessages(matching);
    setTotalEarnings(earnings);
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
          <div className="flex flex-col flex-1 relative">
            <div className="absolute w-full h-full overflow-y-scroll px-2">
              <Link
                href={'/watch?v=' + props.v}
                className="block relative w-full h-0 mb-4"
                style={{ paddingBottom: '56.25%' }}
              >
                <NextImage
                  layout="fill"
                  src={props.thumbnailURL}
                  alt="Thumbnail"
                />
              </Link>
              <h1 className="text-2xl pb-4">{props.title}</h1>
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
                            filteredMessages.length,
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
                <div className="flex">
                  <button
                    type="button"
                    className={buttonStyle}
                    onClick={() =>
                      setStartIndex(Math.max(0, startIndex - pageSize))
                    }
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className={buttonStyle}
                    onClick={() =>
                      setStartIndex(
                        Math.min(filteredMessages.length, startIndex + pageSize)
                      )
                    }
                  >
                    Next
                  </button>
                </div>
                <div className="flex flex-col">
                  <div>Message type</div>
                  {(
                    [
                      ['text_message', 'Text message'],
                      ['paid_message', 'Superchat'],
                      ['membership_item', 'Membership'],
                    ] as Array<[ChatMessageType, string]>
                  ).map(([messageType, label]) => (
                    <label key={messageType}>
                      <input
                        type="checkbox"
                        checked={messageTypes.includes(messageType)}
                        onChange={() => toggleMessageType(messageType)}
                      />{' '}
                      {label}
                    </label>
                  ))}
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    className={[buttonStyle, 'mt-2'].join(' ')}
                    onClick={applyFilters}
                  >
                    Apply filters
                  </button>
                  <div className="flex-1 pl-4">
                    Showing {startIndex} to {startIndex + pageSize} of{' '}
                    {filteredMessages.length} matching messages.
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t">
                <table>
                  <thead>
                    <tr className="border">
                      <th colSpan={2} className="p-2">
                        Superchat earnings
                      </th>
                    </tr>
                    <tr className="border">
                      <th className="text-left p-2">Currency</th>
                      <th className="text-left p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(totalEarnings)
                      .sort((a, b) => totalEarnings[b] - totalEarnings[a])
                      .map((currency) => (
                        <tr className="border">
                          <td className="p-2">{currency}</td>
                          <td className="p-2">
                            {formatNumber(totalEarnings[currency])}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 relative">
            <div className="absolute h-full w-full overflow-y-scroll px-2">
              {filteredMessages
                .slice(startIndex, startIndex + pageSize)
                .map((msg) => (
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
