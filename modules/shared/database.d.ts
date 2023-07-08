/**
 * Video data
 */

export type VideoFile = {
  name: string;
  size: number;
  url?: string;
};

export type VideoMetadata = {
  video_id: string;
  channel_name: string;
  channel_id: string;
  upload_date: string;
  title: string;
  description: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  format_id: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  archived_timestamp: string;
  files: VideoFile[];
  drive_base: string;
  timestamps?: {
    actualStartTime?: string;
    publishedAt?: string;
    scheduledStartTime?: string;
    actualEndTime?: string;
    discoveredUnavailable?: string;
  };
};

export type ElasticSearchDocument<T> = {
  _index: string;
  _type: string;
  _id: string;
  _score: string;
  _source: T;
};

export type ElasticSearchResult<T> = {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: 'eq' | 'gt' | 'lt';
    };
    max_score: number;
    hits: Array<ElasticSearchDocument<T>>;
  };
};

/**
 * Chat replay
 */

type ChatMessageEmoteImage = {
  url: string;
  id: string;
  width?: number;
  height?: number;
};

type ChatMessageEmote = {
  id: string;
  name: string;
  shortcuts: string[];
  search_terms: string[];
  images: ChatMessageEmoteImage[];
  is_custom_emoji: boolean;
};

type ChatMessageBase = {
  time_in_seconds: number;
  action_type: 'add_chat_item' | 'add_live_chat_ticker_item' | string;
  message_id: string;
  timestamp: number;
  time_text: string;
  message: string;
  emotes?: ChatMessageEmote[];
};

type ChatMessageImage = {
  url: string;
  id: string;
  width?: number;
  height?: number;
};

type ChatMessageAuthorBadge = {
  title: string;
  icons: ChatMessageImage[];
};

type ChatMessageAuthor = {
  name: string;
  id: string;
  images: ChatMessageImage[];
  badges?: ChatMessageAuthorBadge[];
};

type ChatMessageMoney = {
  text: string;
  amount: number;
  currency: string;
  currency_symbol: string;
};

type ChatViewerEngagementMessage = ChatMessageBase & {
  icon: 'YOUTUBE_ROUND';
  message_type: 'viewer_engagement_message';
};

type ChatTextMessage = ChatMessageBase & {
  message_type: 'text_message';
  author: ChatMessageAuthor;
};

type ChatMembershipItem = ChatMessageBase & {
  message_type: 'membership_item';
  author: ChatMessageAuthor;
};

type ChatPaidMessage = ChatMessageBase & {
  message_type: 'paid_message';
  author: ChatMessageAuthor & {
    name_text_colour?: string;
  };
  money: ChatMessageMoney;
  timestamp_colour: string;
  body_background_colour: string;
  header_text_colour: string;
  header_background_colour: string;
  body_text_colour: string;
};

export type ChatMessage =
  | ChatViewerEngagementMessage
  | ChatTextMessage
  | ChatMembershipItem
  | ChatPaidMessage;

export const ChatMessageTypes = [
  'paid_message',
  'membership_item',
  'text_message',
  'viewer_engagement_message',
] as const;
export type ChatMessageType = (typeof ChatMessageTypes)[number];

/**
 * Search logs
 */

export type ElasticSearchLog = {
  timestamp: string;
  query: string;
};
