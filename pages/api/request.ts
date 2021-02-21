import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { TASQ_QUEUE_URL } from "../../modules/shared/config";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const v = req.query.v;
  if (!v || typeof v !== "string")
    return res.status(400).json({ ok: false, message: "Missing query v" });
  if (!/^[\w-]{11}$/.test(v))
    return res
      .status(400)
      .json({ ok: false, message: "Invalid YouTube video ID" });

  const result = await axios.request({
    method: "put",
    url: TASQ_QUEUE_URL,
    headers: {
      "X-KEY-PREFIX": "--archiveweb-",
    },
    data: v,
  });

  res.status(200).json({ ok: result.data.ok });
};
