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
  sort?: SortField;
  sort_order?: "asc" | "desc";
  more_like_this?: string;
}) => {
  const q = query.q || "";
  const v = query.v || "";
  const mlt = query.more_like_this || "";

  const should = [];

  if (v) should.push({ match: { video_id: { query: v } } });
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
    should.push({
      more_like_this: {
        fields: ["title", "description", "channel_name"],
        like: mlt,
      },
    });

  const requestData = {
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
