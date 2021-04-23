import { NextApiRequest, NextApiResponse } from "next";
import { ES_INDEX_PAGE_VIEWS } from "../../modules/shared/config";
import { Elastic } from "../../modules/shared/database";
import { getRemoteAddress } from "../../modules/shared/util";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const ip = getRemoteAddress(req);
  if (ip === "127.0.0.1" || ip === "::1") return res.status(204).end();

  await Elastic.request({
    method: "post",
    url: "/" + ES_INDEX_PAGE_VIEWS + "/_doc",
    data: {
      timestamp: new Date().toISOString(),
      channel_id: req.query["channel_id"] || "(none)",
      video_id: req.query["video_id"] || "(none)",
      ip,
    },
  });
  res.status(204).end();
};
