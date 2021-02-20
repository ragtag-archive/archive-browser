import { NextApiRequest, NextApiResponse } from "next";
import {
  ES_BACKEND_URL,
  ES_BASIC_PASSWORD,
  ES_BASIC_USERNAME,
  ES_INDEX,
} from "../../modules/shared/config";
import axios from "axios";

export const apiSearch = async (query: { q?: string; v?: string }) => {
  const q = query.q || "";
  const v = query.v || "";

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

  const requestData = {
    query: {
      bool: {
        should,
      },
    },
  };

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
