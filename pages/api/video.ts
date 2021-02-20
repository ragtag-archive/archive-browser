import { NextApiRequest, NextApiResponse } from "next";
import { DRIVE_BASE_URL } from "../../modules/shared/config";
import axios from "axios";

export const apiVideo = async (query: { v?: string }) => {
  const v = query.v || "";
  if (!v) return { ok: false };

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

  return {
    ok: true,
    urls,
  };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.json(await apiVideo({ v: req.query.v as string }));
};
