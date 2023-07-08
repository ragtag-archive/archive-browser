import { NextApiRequest, NextApiResponse } from 'next';
import {
  ES_INDEX,
  PRIVATE_API_AUTHORIZATION,
} from '../../../../modules/shared/config';
import { metadataSchema } from '../../../../modules/shared/validation';
import { Elastic } from '../../../../modules/shared/database';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check authorization
  const auth = req.headers.authorization;
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (auth !== PRIVATE_API_AUTHORIZATION) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { videoId } = req.query;
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // Check if videoId is valid
  if (typeof videoId !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    res.status(400).json({ error: 'Invalid videoId' });
    return;
  }

  // Validate body
  const { error } = metadataSchema.validate(body);
  if (error) {
    res.status(400).json({ error: 'validation error', details: error.message });
    return;
  }

  // Insert metadata to database
  const result = await Elastic.request({
    method: 'put',
    url: `/${ES_INDEX}/_doc/${videoId}`,
    data: body,
  });

  // Return result
  res.status(result.status).json({ ok: result.data });
};
