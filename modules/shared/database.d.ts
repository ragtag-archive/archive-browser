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
      relation: "eq" | "gt" | "lt";
    };
    max_score: number;
    hits: Array<ElasticSearchDocument<T>>;
  };
};
