import { NextApiRequest, NextApiResponse } from "next";
import { apiListChannels } from "./search";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(await apiListChannels());
};
