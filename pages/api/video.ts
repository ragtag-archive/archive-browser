import { NextApiRequest, NextApiResponse } from "next";
import { DRIVE_BASE_URL } from "../../modules/shared/config";
import axios from "axios";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const v = req.query.v || "";
  if (!v) return res.status(400).json({ ok: false });

  const searchRes = await axios.request({
    method: "get",
    baseURL: DRIVE_BASE_URL,
    url: "/" + v + "/",
  });

  const re = /href="(.*?)"/gm;
  const urls = [];
  let m: RegExpExecArray;
  do {
    m = re.exec(searchRes.data);
    if (m) urls.push(m[1]);
  } while (m);

  res.json({
    ok: true,
    urls,
  });
};
