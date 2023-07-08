import React from 'react';
import Head from 'next/head';
import { VideoMetadata } from './shared/database.d';
import VideoPlayer2 from './shared/VideoPlayer/VideoPlayer2';
import VideoPlayerHead from './shared/VideoPlayerHead';

export type VideoEmbedPageProps = {
  videoInfo: VideoMetadata;
};

const getFile = (videoInfo: VideoMetadata, suffix: string) =>
  videoInfo.files.find((file) => file.name.includes(suffix))?.url;

const VideoEmbedPage = (props: VideoEmbedPageProps) => {
  const { videoInfo } = props;

  const [fmtVideo, fmtAudio] = videoInfo.format_id.split('+');
  const urlVideo = getFile(videoInfo, '.f' + fmtVideo);
  const urlAudio = getFile(videoInfo, '.f' + fmtAudio);
  const urlThumb = getFile(videoInfo, '.webp') || getFile(videoInfo, '.jpg');

  // Track page view
  React.useEffect(() => {
    if (!videoInfo) return;
    fetch(
      '/api/pv?channel_id=' +
        videoInfo.channel_id +
        '&video_id=' +
        videoInfo.video_id
    );
  }, [videoInfo]);

  return (
    <>
      <VideoPlayerHead videoInfo={videoInfo} />
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="absolute inset-0">
        <VideoPlayer2
          showWatermark
          videoId={videoInfo.video_id}
          srcVideo={urlVideo}
          srcAudio={urlAudio}
          srcPoster={urlThumb}
          captions={videoInfo.files
            .filter((file) => file.name.endsWith('.ytt'))
            .map(({ name }) => {
              const lang = name.split('.')[1];
              return {
                lang,
                src: getFile(videoInfo, name),
              };
            })}
        />
      </div>
    </>
  );
};

export default VideoEmbedPage;
