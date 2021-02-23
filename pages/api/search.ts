import { NextApiRequest, NextApiResponse } from "next";
import {
  ES_BACKEND_URL,
  ES_BASIC_PASSWORD,
  ES_BASIC_USERNAME,
  ES_INDEX,
} from "../../modules/shared/config";
import axios from "axios";

type AggregatedChannel = {
  channel_name: string;
  channel_id: string;
  videos_count: number;
};

export const apiListChannels = async (): Promise<AggregatedChannel[]> =>
  (
    await apiSearchRaw({
      aggs: {
        channels: {
          terms: { field: "channel_name", size: 1000 },
          aggs: { channel_id: { terms: { field: "channel_id", size: 1 } } },
        },
      },
      size: 0,
    })
  ).data.aggregations.channels.buckets.map((bucket) => ({
    channel_name: bucket.key,
    channel_id: bucket.channel_id.buckets[0].key,
    videos_count: bucket.doc_count,
  }));

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
  more_like_this?: { title: string; description: string; channel_name: string };
  from?: number;
  size?: number;
}) => {
  const q = query.q || "";
  const v = query.v || "";
  const channel_id = query.channel_id;
  const mlt = query.more_like_this || "";
  const from = query.from || 0;
  const size = query.size || 10;

  const should = [];

  if (v) should.push({ match: { video_id: { query: v } } });
  if (channel_id) should.push({ match: { channel_id: { query: channel_id } } });
  if (q) {
    // Workaround for channel_name being keyword instead of text
    // Fetch list of channels
    const channels = await apiListChannels();
    channels
      // Filter for channels containing query
      .filter((channel) =>
        channel.channel_name.toLowerCase().includes(q.toLowerCase())
      )
      // Insert channel IDs to query
      .forEach((channel) =>
        should.push({ match: { channel_id: { query: channel.channel_id } } })
      );

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
      }
    );
  }
  if (mlt)
    should.push(
      {
        more_like_this: {
          fields: ["title"],
          like: mlt.title,
        },
      },
      {
        more_like_this: {
          fields: ["description"],
          like: mlt.description,
        },
      },
      {
        more_like_this: {
          fields: ["channel_name"],
          like: mlt.channel_name,
        },
      }
    );

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
  axios.request({
    method: "get",
    baseURL: ES_BACKEND_URL,
    url: "/" + ES_INDEX + "/_search",
    auth: {
      username: ES_BASIC_USERNAME,
      password: ES_BASIC_PASSWORD,
    },
    data: dsl,
  });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const searchRes = await apiSearch({
    q: req.query.q as string,
    v: req.query.v as string,
  });
  res.json(searchRes.data);
};
