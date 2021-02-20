import { NextApiRequest, NextApiResponse } from "next";
import {
  ES_BACKEND_URL,
  ES_BASIC_PASSWORD,
  ES_BASIC_USERNAME,
  ES_INDEX,
} from "../../modules/shared/config";
import axios from "axios";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const q = req.query.q || "";
  const v = req.query.v || "";

  const searchRes = await axios.request({
    method: "get",
    baseURL: ES_BACKEND_URL,
    url: "/" + ES_INDEX + "/_search",
    auth: {
      username: ES_BASIC_USERNAME,
      password: ES_BASIC_PASSWORD,
    },
    data: !!v
      ? {
          query: {
            match: {
              video_id: {
                query: v,
              },
            },
          },
        }
      : !q
      ? undefined
      : {
          query: {
            bool: {
              should: [
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
                },
              ],
            },
          },
        },
  });

  res.json(searchRes.data);
};
