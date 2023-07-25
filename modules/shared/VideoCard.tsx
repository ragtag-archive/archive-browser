import React from 'react';
import Link from 'next/link';
import { VideoMetadata } from './database.d';
import { formatDate, formatSeconds } from './format';
import { format } from 'timeago.js';
import VideoActionButtons from './VideoActionButtons';
import ClientRender from './ClientRender';
import { NextImage } from './NextImage';
import { parseTimestamp } from './util';

export type VideoCardProps = {
  video?: VideoMetadata;
  small?: boolean;
};

const VideoCard = React.memo(({ video, small }: VideoCardProps) => {
  const thumbURL = video?.files?.find(
    (file) => file.name.endsWith('.webp') || file.name.endsWith('.jpg')
  )?.url;

  return (
    <div
      className={['flex', small ? 'flex-col' : 'flex-col md:flex-row'].join(
        ' '
      )}
    >
      <div className={small ? 'w-full' : 'md:w-1/4 w-full py-2'}>
        <Link href={video ? '/watch?v=' + video?.video_id : ''} tabIndex={-1}>
          <div
            className="w-full h-0 relative"
            style={{ paddingBottom: '56.25%' }}
          >
            {!!thumbURL ? (
              <>
                <div className="bg-gray-800 animate-pulse absolute inset-0" />
                <div className="absolute inset-0">
                  <NextImage
                    src={thumbURL}
                    width={368}
                    height={207}
                    layout="responsive"
                    alt="Video thumbnail"
                  />
                </div>
              </>
            ) : (
              <img
                src={
                  'https://i.ytimg.com/vi_webp/' +
                  video?.video_id +
                  '/maxresdefault.webp'
                }
                className="absolute w-full h-full"
              />
            )}
            <div className="absolute right-0 bottom-0 bg-black text-white px-2 bg-opacity-75 rounded m-2">
              {formatSeconds(video?.duration || 0)}
            </div>
          </div>
        </Link>
      </div>
      <div className={small ? 'py-2 md:px-0 px-4' : 'flex-1 px-4 py-2'}>
        {!!video ? (
          <>
            <Link href={video ? '/watch?v=' + video?.video_id : ''}>
              <h2 className={['font-bold', small ? '' : 'text-xl'].join(' ')}>
                {video.title}
              </h2>
            </Link>
            <Link
              href={'/channel/' + video.channel_id}
              className={[
                'text-gray-400 hover:text-white hover:underline inline-block',
                'transition duration-200',
                small && 'text-sm',
              ].join(' ')}
            >
              {video.channel_name}
            </Link>
            <ClientRender enableSSR>
              <p className={['text-gray-400', small && 'text-sm'].join(' ')}>
                {Intl.NumberFormat('en-US').format(video.view_count)} views
                &middot;{' '}
                <span
                  title={
                    video.timestamps?.publishedAt
                      ? new Date(video.timestamps?.publishedAt).toLocaleString()
                      : '(exact timestamp unknown)'
                  }
                >
                  Uploaded{' '}
                  {formatDate(
                    new Date(video.timestamps?.publishedAt || video.upload_date)
                  )}
                </span>{' '}
                &middot;{' '}
                <span
                  title={parseTimestamp(
                    video.archived_timestamp
                  ).toLocaleString()}
                >
                  Archived{' '}
                  {format(parseTimestamp(video.archived_timestamp), 'en_US')}
                </span>
              </p>
            </ClientRender>
            {!small && <VideoActionButtons video={video} />}
          </>
        ) : (
          <div>
            <h2 className="text-xl bg-gray-800 animate-pulse w-1/3">&nbsp;</h2>
            <div className="bg-gray-800 animate-pulse w-full h-16 mt-2">
              &nbsp;
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default VideoCard;
