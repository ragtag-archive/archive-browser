import { NextApiRequest, NextApiResponse } from 'next';
import { DRIVE_BASE_URL } from '../../modules/shared/config';
import axios from 'axios';

export const apiVideo = async (query: { v?: string }) => {
  const v = query.v || '';
  if (!v) return { ok: false };

  const searchRes = await axios.request({
    method: 'get',
    baseURL: DRIVE_BASE_URL,
    url: '/' + v + '/',
  });

  const files = searchRes.data.files;

  return {
    ok: true,
    files,
  };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.json(await apiVideo({ v: req.query.v as string }));
};
