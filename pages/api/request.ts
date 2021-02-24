import axios from "axios";
import jsonwebtoken from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import {
  BULK_INSERT_ROLE,
  HCAPTCHA_SECRET_KEY,
  JWT_PUBLIC_KEY,
  TASQ_QUEUE_URL,
} from "../../modules/shared/config";

const reId = /^[\w-]{11}$/;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const jwt = req.query.jwt;
  const captcha = req.query.captcha;

  if (jwt && typeof jwt === "string") {
    /**
     * Validate video IDs
     */
    const videos = req.body.videos;

    if (!Array.isArray(videos))
      return res.status(400).json({ ok: false, message: "Malformed body" });

    if (videos.length > 1000)
      return res.status(400).json({
        ok: false,
        message: "You can only request at most 1000 videos at a time.",
      });

    if (videos.filter((vid) => !reId.test(vid)).length > 0)
      return res.status(400).json({
        ok: false,
        message: "Videos array contains non-compliant IDs.",
      });

    /**
     * Validate JWT
     */
    let token = {
      chan: "",
      msg: "",
      roles: [],
      iat: 0,
      exp: 0,
      iss: "",
      sub: "",
    };
    try {
      token = jsonwebtoken.verify(jwt.trim(), JWT_PUBLIC_KEY, {
        algorithms: ["RS256"],
      }) as any;
    } catch (ex) {
      return res.status(400).json({
        ok: false,
        message:
          ex.name === "TokenExpiredError"
            ? "JWT has expired, please request a new one."
            : "Invalid JWT",
      });
    }

    /**
     * Validate roles
     */
    if (!Array.isArray(token.roles) || !token.roles.includes(BULK_INSERT_ROLE))
      return res.status(400).json({
        ok: false,
        message:
          "Insufficient permissions. Please contact an administrator for assistance.",
      });

    /**
     * Insert
     */
    const queuedIds = [];
    const failedIds = [];
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      const result = await axios
        .request({
          method: "put",
          url: TASQ_QUEUE_URL,
          headers: {
            "X-KEY-PREFIX": "--archivewebbulk-" + token.sub + "-",
          },
          data: v,
        })
        .then((response) => response.data)
        .catch(({ response }) => response.data);
      if (result.ok) queuedIds.push(v);
      else failedIds.push(v);
    }
    return res.status(200).json({
      ok: true,
      message:
        "Completed " +
        queuedIds.length +
        " insertions with " +
        failedIds.length +
        " failures",
      payload: { queuedIds, failedIds },
    });
  } else if (captcha && typeof captcha === "string") {
    /**
     * Validate video ID
     */
    const v = req.query.v;
    if (!v || typeof v !== "string")
      return res.status(400).json({ ok: false, message: "Missing query v" });
    if (!reId.test(v))
      return res
        .status(400)
        .json({ ok: false, message: "Invalid YouTube video ID" });

    /**
     * Validate hCaptcha
     */
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
    const result = await axios
      .request({
        method: "put",
        url: TASQ_QUEUE_URL,
        headers: {
          "X-KEY-PREFIX": "--archiveweb-",
        },
        data: v,
      })
      .then((response) => response.data)
      .catch(({ response }) => response.data);

    res.status(200).json({
      ok: result.ok,
      message: result.ok
        ? "Video queued successfully"
        : "Error inserting video into queue",
    });
  } else return res.status(400).json({ ok: false, message: "Missing CAPTCHA" });
};
