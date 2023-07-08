import Joi from 'joi';

const metadataFileEntrySchema = Joi.object({
  name: Joi.string().required(),
  size: Joi.number().required(),
});

const metadataTimestampsSchema = Joi.object({
  actualStartTime: Joi.string().optional(),
  publishedAt: Joi.string().optional(),
  scheduledStartTime: Joi.string().optional(),
  actualEndTime: Joi.string().optional(),
});

export const metadataSchema = Joi.object({
  video_id: Joi.string().required(),
  channel_name: Joi.string().required(),
  channel_id: Joi.string().required(),
  upload_date: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  duration: Joi.number().required(),
  width: Joi.number().required(),
  height: Joi.number().required(),
  fps: Joi.number().required(),
  format_id: Joi.string().required(),
  view_count: Joi.number().required(),
  like_count: Joi.number().required(),
  dislike_count: Joi.number().required(),
  files: Joi.array().items(metadataFileEntrySchema).required(),
  drive_base: Joi.string().required(),
  archived_timestamp: Joi.string().required(),
  timestamps: metadataTimestampsSchema.optional(),
});
