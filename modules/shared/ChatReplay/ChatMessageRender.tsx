import React from 'react';
import { ChatMessage } from '../database.d';
import { formatSeconds } from '../format';
import { proxyYT3 as proxyURL } from '../util';

export type ChatMessageRenderProps = {
  message: ChatMessage;
};

const regexEmoji = /(:[^:]+:)/g;

const ChatMessageRender = React.memo((props: ChatMessageRenderProps) => {
  const msg = props.message;

  const generateMessageContent = (msg: ChatMessage) => {
    if (!msg.emotes) return msg.message;

    // Process emotes
    const tokens = msg.message.split(regexEmoji);
    return tokens.map((token) => {
      if (!token.startsWith(':')) return token;

      let images = msg.emotes.find((emote) => emote.name === token)?.images;
      if (!images)
        images = msg.emotes.find((emote) =>
          emote.shortcuts.includes(token)
        )?.images;
      if (!images) return token;

      const emoteURL =
        images.find((image) => image.id === 'source')?.url || images[0]?.url;

      if (!emoteURL) return token;
      return (
        <img
          src={proxyURL(emoteURL)}
          alt={token}
          title={token}
          className="inline-block w-6 h-6"
        />
      );
    });
  };

  switch (msg.message_type) {
    case 'paid_message':
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
                    alt={msg.author.badges[0].title}
                    title={msg.author.badges[0].title}
                    className="inline-block ml-2 w-4 h-4"
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
          <div className="px-4 py-2">{generateMessageContent(msg)}</div>
        </div>
      );
    case 'membership_item':
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
                  alt={msg.author.badges[0].title}
                  title={msg.author.badges[0].title}
                  className="inline-block ml-2 w-4 h-4"
                />
              ) : null}
            </div>
            <div className="text-sm">
              [{formatSeconds(msg.time_in_seconds)}]
            </div>
          </div>
          {generateMessageContent(msg)}
        </div>
      );
    case 'text_message':
      const authorType =
        msg.author.badges?.map(({ title }) =>
          title === 'Owner'
            ? 'owner'
            : title === 'Moderator'
            ? 'moderator'
            : title.toLowerCase().includes('member')
            ? 'member'
            : ''
        ) || [];
      return (
        <div key={msg.message_id} className="px-2 mb-2">
          <div className="text-gray-400 text-xs flex justify-between">
            <span
              className={[
                'mr-2',
                authorType.includes('owner')
                  ? 'bg-blue-600 text-white font-bold px-2 rounded'
                  : authorType.includes('moderator')
                  ? 'text-blue-600 font-bold'
                  : authorType.includes('member')
                  ? 'text-green-500'
                  : '',
              ].join(' ')}
            >
              {msg.author.name}
              {authorType.includes('moderator') && (
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
                    alt={badge.title}
                    title={badge.title}
                    src={proxyURL(badge.icons?.[1]?.url)}
                    className="inline-block ml-2 w-4 h-4"
                  />
                ) : null
              )}
            </span>
            <span>[{formatSeconds(msg.time_in_seconds)}]</span>
          </div>
          {generateMessageContent(msg)}
        </div>
      );
  }

  return null;
});

export default ChatMessageRender;
