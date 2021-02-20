import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { DRIVE_BASE_URL } from "../../modules/shared/config";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { v, lang } = req.query;
  const sub = await axios.get(
    DRIVE_BASE_URL + "/" + v + "/" + v + "." + lang + ".vtt"
  );
  res.send(sub.data);
  res.end();
};
