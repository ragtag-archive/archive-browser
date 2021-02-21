import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  HCAPTCHA_SECRET_KEY,
  TASQ_QUEUE_URL,
} from "../../modules/shared/config";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  /**
   * Validate video ID
   */
  const v = req.query.v;
  if (!v || typeof v !== "string")
    return res.status(400).json({ ok: false, message: "Missing query v" });
  if (!/^[\w-]{11}$/.test(v))
    return res
      .status(400)
      .json({ ok: false, message: "Invalid YouTube video ID" });

  /**
   * Validate hCaptcha
   */
  const captcha = req.query.captcha;
  const hcap = await axios.request({
    method: "post",
    url: "https://hcaptcha.com/siteverify",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    data: `response=${captcha}&secret=${HCAPTCHA_SECRET_KEY}`,
  });

  if (!hcap.data.success)
    return res.status(400).json({ ok: false, message: "Invalid CAPTCHA" });

  /**
   * Insert video into queue
   */
  const result = await axios.request({
    method: "put",
    url: TASQ_QUEUE_URL,
    headers: {
      "X-KEY-PREFIX": "--archiveweb-",
    },
    data: v,
  });

  res.status(200).json({
    ok: result.data.ok,
    message: result.data.ok
      ? "Video queued successfully"
      : "Error inserting video into queue",
  });
};
