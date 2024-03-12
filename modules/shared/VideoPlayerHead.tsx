import Head from 'next/head';
import { VideoMetadata } from './database.d';
import { SITE_NAME, SITE_URL } from './config';

export type VideoPlayerHeadProps = {
  videoInfo: VideoMetadata;
};

const VideoPlayerHead = (props: VideoPlayerHeadProps) => {
  const { videoInfo } = props;
  const urlThumb =
    videoInfo.files.find(
      (file) => file.name.endsWith('.jpg') || file.name.endsWith('.webp')
    )?.url ||
    'https://i.ytimg.com/vi/' + videoInfo.video_id + '/maxresdefault.jpg';
  const canonURL = SITE_URL + 'watch?v=' + videoInfo.video_id;

  return (
    <Head>
      <title>
        {videoInfo.title} - {SITE_NAME}
      </title>
      <meta name="title" content={videoInfo.title} />
      <meta name="description" content={videoInfo.channel_name} />
      <link rel="canonical" href={canonURL} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonURL} />
      <meta property="og:title" content={videoInfo.title} />
      <meta property="og:description" content={videoInfo.channel_name} />
      <meta property="og:image" content={urlThumb} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonURL} />
      <meta property="twitter:title" content={videoInfo.title} />
      <meta property="twitter:description" content={videoInfo.channel_name} />
      <meta property="twitter:image" content={urlThumb} />
    </Head>
  );
};

export default VideoPlayerHead;
