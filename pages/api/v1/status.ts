import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export type WorkerStatus = {
  event:
    | "work_begin"
    | "work_end"
    | "work_failed"
    | "video_downloading"
    | "video_failed"
    | "video_downloaded"
    | "video_uploading"
    | "video_uploaded"
    | "worker_updated"
    | "rate_limit";
    source: string;
    timestamp: number;
    data: {
      video_id?: string
    }
};

export const apiStatus = async () => {
  return axios
    .request({
      method: "get",
      baseURL: "https://ragtag-archive-webhook.ragtag.workers.dev/",
    })
    .then((res) => res.data);
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return res.status(200).json(await apiStatus());
  } else {
    return res
      .writeHead(405, "Method not allowed", {
        Allow: "GET",
      })
      .json({ ok: false, code: 405, message: "Method not allowed" });
  }
};
