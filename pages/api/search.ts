import { NextApiRequest, NextApiResponse } from "next";
import {
  ES_BACKEND_URL,
  ES_BASIC_PASSWORD,
  ES_BASIC_USERNAME,
  ES_INDEX,
} from "../../modules/shared/config";
import axios from "axios";
import {
  ElasticSearchResult,
  VideoMetadata,
} from "../../modules/shared/database";

export type StorageStatistics = {
  videos: number;
  files: number;
  size: number;
};
export const apiStorageStatistics = async (): Promise<StorageStatistics> => {
  const res = await apiSearchRaw({
    size: 0,
    query: {
      match_all: {},
    },
    aggregations: {
      size: {
        nested: {
          path: "files",
        },
        aggregations: {
          sum_size: {
            sum: {
              field: "files.size",
            },
          },
        },
      },
    },
  });

  return {
    videos: res.data.hits.total.value,
    files: res.data.aggregations.size.doc_count,
    size: res.data.aggregations.size.sum_size.value,
  };
};

export type AggregatedChannel = {
  channel_name: string;
  channel_id: string;
  videos_count: number;
};

export const apiListChannels = async (): Promise<AggregatedChannel[]> =>
  (
    await apiSearchRaw({
      aggs: {
        channels: {
          terms: { field: "channel_id", size: 1000 },
          aggs: { hits: { top_hits: { _source: ["channel_name"], size: 1 } } },
        },
      },
      size: 0,
    })
  ).data.aggregations.channels.buckets.map((bucket) => ({
    channel_id: bucket.key,
    channel_name: bucket.hits.hits.hits[0]._source.channel_name,
    videos_count: bucket.doc_count,
  }));

export const apiRelatedVideos = async (
  videoId: string
): Promise<ElasticSearchResult<VideoMetadata>> => {
  const mlt = (
    await apiSearchRaw({
      query: {
        more_like_this: {
          fields: ["title", "description", "channel_name"],
          like: [
            {
              _index: ES_INDEX,
              _id: videoId,
            },
          ],
        },
      },
    })
  ).data as ElasticSearchResult<VideoMetadata>;

  if (mlt.hits.total.value > 1) return mlt;

  // more_like_this didn't find any hits
  // try to find other videos from the channel
  const videoInfo = (await apiSearch({ v: videoId }))
    .data as ElasticSearchResult<VideoMetadata>;
  if (videoInfo.hits.total.value < 1) return mlt;

  const channel_uploads = await apiSearch({
    channel_id: videoInfo.hits.hits[0]._source.channel_id,
  });
  return channel_uploads.data;
};

type SortField =
  | "archived_timestamp"
  | "upload_date"
  | "duration"
  | "view_count"
  | "like_count"
  | "dislike_count";

export const apiSearch = async (query: {
  q?: string;
  v?: string;
  channel_id?: string;
  sort?: SortField;
  sort_order?: "asc" | "desc";
  from?: number;
  size?: number;
}) => {
  const q = query.q || "";
  const v = query.v || "";
  const channel_id = query.channel_id;
  const from = query.from || 0;
  const size = query.size || 10;

  const should = [];

  if (v) should.push({ match: { video_id: { query: v } } });
  if (channel_id) should.push({ match: { channel_id: { query: channel_id } } });
  if (q) {
    should.push(
      {
        match: {
          video_id: {
            query: q,
          },
        },
      },
      {
        match: {
          title: {
            query: q,
            operator: "OR",
            fuzziness: "AUTO",
          },
        },
      },
      {
        match: {
          description: {
            query: q,
            operator: "OR",
            fuzziness: "AUTO",
          },
        },
      },
      {
        match: {
          channel_name: {
            query: q,
            operator: "OR",
            fuzziness: "AUTO",
            boost: 10,
          },
        },
      }
    );
  }

  const requestData = {
    from,
    size,
    query: {
      bool: {
        should,
      },
    },
  };

  if (query.sort) {
    requestData["sort"] = [
      {
        [query.sort]: query.sort_order || "asc",
      },
    ];
  }

  return apiSearchRaw(requestData);
};

export const apiSearchRaw = (dsl: any) =>
  axios
    .request({
      method: "get",
      baseURL: ES_BACKEND_URL,
      url: "/" + ES_INDEX + "/_search",
      auth: {
        username: ES_BASIC_USERNAME,
        password: ES_BASIC_PASSWORD,
      },
      data: dsl,
    })
    .catch(({ response }) => response);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.body) {
    console.log(req.body);
    const searchRes = await apiSearchRaw(
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    );
    res.json(searchRes.data);
  } else {
    const searchRes = await apiSearch({
      q: req.query.q as string,
      v: req.query.v as string,
    });
    res.json(searchRes.data);
  }
};
