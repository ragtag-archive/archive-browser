import { NextApiRequest, NextApiResponse } from "next";
import { ES_INDEX, ES_INDEX_PAGE_VIEWS } from "../../modules/shared/config";
import {
  ElasticSearchResult,
  VideoMetadata,
} from "../../modules/shared/database.d";
import { Elastic } from "../../modules/shared/database";
import { getRemoteAddress } from "../../modules/shared/util";

export const apiGetPopularVideos = async (max: number = 8) => {
  // Create aggreagation
  const buckets = await Elastic.request({
    method: "post",
    url: "/" + ES_INDEX_PAGE_VIEWS + "/_search",
    data: {
      query: {
        bool: {
          must_not: [
            {
              match: {
                video_id: "(none)",
              },
            },
          ],
          filter: [
            {
              range: {
                timestamp: {
                  gte: "now-7d",
                },
              },
            },
          ],
        },
      },
      size: 0,
      aggs: {
        x: {
          date_histogram: {
            field: "timestamp",
            fixed_interval: "1h",
            min_doc_count: 1,
          },
          aggs: {
            videos: {
              terms: {
                field: "video_id",
                order: {
                  _count: "desc",
                },
                size: 10,
                min_doc_count: 3,
              },
            },
          },
        },
      },
    },
  }).then((res) => res.data.aggregations.x.buckets);

  // Calculate video scores
  const tmin = buckets[0].key;
  const tmax = buckets[buckets.length - 1].key;
  const trange = tmax - tmin;
  const scoremap: { [key: string]: number } = {};
  for (const { key: timestamp, videos } of buckets) {
    const tscore = (timestamp - tmin) / trange;
    for (const { key: id, doc_count: hits } of videos.buckets) {
      if (!scoremap[id]) scoremap[id] = 0;
      scoremap[id] += tscore * hits;
    }
  }

  // Sort videos
  const scoreArray = Object.keys(scoremap)
    .map((id) => ({ id, score: scoremap[id] }))
    .sort((a, b) => b.score - a.score);
  const videoIds = scoreArray.map((x) => x.id);

  // Get video documents
  const videos = await Elastic.request({
    method: "get",
    url: "/" + ES_INDEX + "/_mget",
    data: { ids: videoIds },
  });

  const result: Partial<ElasticSearchResult<VideoMetadata>> = {
    hits: {
      total: {
        relation: "eq",
        value: videos.data.docs.length,
      },
      max_score: 0,
      hits: videos.data.docs.filter((hit) => hit._source).slice(0, max),
    },
  };
  return result;
};

export const apiRegisterPageview = async (params: {
  channelId?: string;
  videoId?: string;
  ip: string;
}) =>
  Elastic.request({
    method: "post",
    url: "/" + ES_INDEX_PAGE_VIEWS + "/_doc",
    data: {
      timestamp: new Date().toISOString(),
      channel_id: params.channelId || "(none)",
      video_id: params.videoId || "(none)",
      ip: params.ip,
    },
  });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const ip = getRemoteAddress(req);
  if (ip === "127.0.0.1" || ip === "::1") return res.status(204).end();

  await apiRegisterPageview({
    channelId: String(req.query.channel_id),
    videoId: String(req.query.videoId),
    ip,
  });
  res.status(204).end();
};
