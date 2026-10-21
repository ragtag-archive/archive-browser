import { NextApiRequest, NextApiResponse } from 'next';
import { DRIVE_BASE_URL } from '../../modules/shared/config';
import axios from 'axios';

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export const apiVideo = async (query: { v?: string }) => {
  const v = query.v || '';
  if (!VIDEO_ID_PATTERN.test(v)) return { ok: false };

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
  const v = req.query.v;
  if (typeof v !== 'string' || !VIDEO_ID_PATTERN.test(v)) {
    res.status(400).json({ ok: false, error: 'invalid video id' });
    return;
  }
  res.json(await apiVideo({ v }));
};
