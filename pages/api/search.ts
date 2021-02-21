import { NextApiRequest, NextApiResponse } from "next";
import {
  ES_BACKEND_URL,
  ES_BASIC_PASSWORD,
  ES_BASIC_USERNAME,
  ES_INDEX,
} from "../../modules/shared/config";
import axios from "axios";

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
  if (q)
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
          },
        },
      }
    );
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

  return axios.request({
    method: "get",
    baseURL: ES_BACKEND_URL,
    url: "/" + ES_INDEX + "/_search",
    auth: {
      username: ES_BASIC_USERNAME,
      password: ES_BASIC_PASSWORD,
    },
    data: requestData,
  });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const searchRes = await apiSearch({
    q: req.query.q as string,
    v: req.query.v as string,
  });
  res.json(searchRes.data);
};
