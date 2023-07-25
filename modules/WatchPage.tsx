import React from 'react';
import PageBase from './shared/PageBase';
import { VideoMetadata } from './shared/database.d';
import { formatDate } from './shared/format';
import ChatReplayPanel from './shared/ChatReplay/ChatReplayPanel';
import VideoCard from './shared/VideoCard';
import Link from 'next/link';
import ServiceUnavailablePage from './ServiceUnavailablePage';
import VideoActionButtons from './shared/VideoActionButtons';
import { useWindowSize } from './shared/hooks/useWindowSize';
import MemoLinkify from './shared/MemoLinkify';
import VideoPlayerHead from './shared/VideoPlayerHead';
import ClientRender from './shared/ClientRender';
import VideoPlayer2 from './shared/VideoPlayer/VideoPlayer2';
import ExpandableContainer from './ExpandableContainer';
import CommentSection from './CommentSection';
import { NextImage } from './shared/NextImage';
import { parseTimestamp } from './shared/util';

const format = (n: number) => Intl.NumberFormat('en-US').format(n);

export type WatchPageProps = {
  videoInfo: VideoMetadata;
  hasChat: boolean;
  relatedVideos: VideoMetadata[];
  channelVideoCount: number;
  channelProfileURL: string;

  disablePlayback: boolean;
};

const getFile = (videoInfo: VideoMetadata, suffix: string) =>
  videoInfo.files.find((file) => file.name.includes(suffix))?.url;

const WatchPage = (props: WatchPageProps) => {
  if (!props.videoInfo) return <ServiceUnavailablePage />;

  const { videoInfo, hasChat, relatedVideos } = props;

  const [isChatVisible, setIsChatVisible] = React.useState(false);
  const refMobileScrollTarget = React.useRef<HTMLDivElement>(null);
  const { innerWidth, innerHeight } = useWindowSize();

  React.useEffect(() => {
    if (isChatVisible)
      refMobileScrollTarget.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isChatVisible]);

  React.useEffect(() => {
    if (!videoInfo || window.location.host.startsWith('localhost')) return;
    fetch(
      '/api/pv?channel_id=' +
        videoInfo.channel_id +
        '&video_id=' +
        videoInfo.video_id
    );
  }, [videoInfo]);

  const [playbackProgress, setPlaybackProgress] = React.useState(0);
  const [fmtVideo, fmtAudio] = videoInfo.format_id.split('+');
  const urlVideo =
    getFile(videoInfo, '.f' + fmtVideo) ??
    getFile(videoInfo, '.webm') ??
    getFile(videoInfo, '.mp4') ??
    getFile(videoInfo, '.mkv');
  const urlAudio = getFile(videoInfo, '.f' + fmtAudio) ?? urlVideo;
  const urlThumb = getFile(videoInfo, '.webp') || getFile(videoInfo, '.jpg');
  const urlChat =
    getFile(videoInfo, '.chat.json') || getFile(videoInfo, '.live_chat.json');
  const urlInfo = getFile(videoInfo, '.info.json');

  return (
    <PageBase>
      <VideoPlayerHead videoInfo={videoInfo} />
      <div
        className={['flex lg:flex-row flex-col lg:h-auto'].join(' ')}
        style={{
          height: isChatVisible && innerWidth < 640 ? innerHeight : 'auto',
        }}
      >
        <div className="w-full lg:w-3/4">
          <div className="lg:absolute lg:top-0" ref={refMobileScrollTarget} />
          <div
            className="relative bg-gray-400 h-0"
            style={{ paddingBottom: '56.25%' }}
          >
            {props.disablePlayback ? (
              <div
                className="
                  absolute inset-0 w-full h-full
                  flex flex-col items-center justify-center bg-gray-900
                "
              >
                <p className="text-2xl">
                  Video playback is currently disabled.
                </p>
                <p>
                  Due to high server load, video playback is currently disabled.
                  Please check back later.
                </p>
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full">
                <VideoPlayer2
                  key={urlVideo}
                  videoId={videoInfo.video_id}
                  srcVideo={urlVideo}
                  srcAudio={urlAudio}
                  srcPoster={urlThumb}
                  captions={videoInfo.files
                    .filter(
                      (file) =>
                        file.name.endsWith('.ytt') ||
                        file.name.endsWith('.srv3')
                    )
                    .map(({ name }) => {
                      const lang = name.split('.')[1];
                      return {
                        lang,
                        src: getFile(videoInfo, name),
                      };
                    })}
                  onPlaybackProgress={setPlaybackProgress}
                  autoplay
                />
              </div>
            )}
          </div>
        </div>
        <div
          className={[
            'w-full lg:w-1/4 lg:pl-4',
            isChatVisible ? 'flex-1' : '',
          ].join(' ')}
        >
          {props.disablePlayback ? (
            <div className="border border-gray-800 rounded p-4 text-center">
              <p>Chat replay is currently disabled</p>
            </div>
          ) : !hasChat ? (
            <div className="border border-gray-800 rounded p-4 text-center">
              <p>Chat replay unavailable</p>
            </div>
          ) : (
            <ChatReplayPanel
              src={urlChat}
              currentTimeSeconds={playbackProgress}
              onChatToggle={setIsChatVisible}
            />
          )}
        </div>
      </div>
      <div className="flex lg:flex-row flex-col">
        <div className="w-full lg:w-3/4">
          <div className="mt-4 mx-6">
            <h1 className="text-2xl mb-2">{videoInfo.title}</h1>
            <div className="flex flex-row justify-between">
              <ClientRender enableSSR>
                <p className="text-gray-400">
                  {format(videoInfo.view_count)} views &middot;{' '}
                  <span
                    title={
                      videoInfo.timestamps?.publishedAt
                        ? new Date(
                            videoInfo.timestamps?.publishedAt
                          ).toLocaleString()
                        : '(exact timestamp unknown)'
                    }
                  >
                    Uploaded{' '}
                    {formatDate(
                      new Date(
                        videoInfo.timestamps?.publishedAt ||
                          videoInfo.upload_date
                      )
                    )}
                  </span>{' '}
                  &middot;{' '}
                  <span
                    title={parseTimestamp(
                      videoInfo.archived_timestamp
                    ).toLocaleString()}
                  >
                    Archived{' '}
                    {formatDate(parseTimestamp(videoInfo.archived_timestamp))}
                  </span>
                </p>
              </ClientRender>
              <div>
                <span className="text-green-500">
                  {format(videoInfo.like_count)} likes
                </span>{' '}
                /{' '}
                <span className="text-red-500">
                  {format(videoInfo.dislike_count)} dislikes
                </span>
              </div>
            </div>
            <div className="flex flex-row mt-2">
              <VideoActionButtons full video={videoInfo} />
            </div>
            <div className="mt-4 pb-4 border-b border-gray-900">
              <div className="inline-block">
                <Link
                  href={'/channel/' + videoInfo.channel_id}
                  className="mb-4 mb-4 hover:underline flex flex-row"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden relative">
                    <NextImage
                      priority
                      alt="Channel thumbnail"
                      src={props.channelProfileURL}
                      layout="fixed"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-lg leading-tight">
                      {videoInfo.channel_name}
                    </p>
                    <span className="text-gray-400 leading-tight">
                      {props.channelVideoCount} videos
                    </span>
                  </div>
                </Link>
              </div>
              <ExpandableContainer>
                <div className="whitespace-pre-line break-words text-gray-300">
                  <MemoLinkify linkClassName="text-blue-300 hover:underline focus:outline-none focus:underline">
                    {videoInfo.description}
                  </MemoLinkify>
                </div>
              </ExpandableContainer>
            </div>
            <div className="mt-4">
              <CommentSection
                videoId={videoInfo.video_id}
                infoJsonURL={urlInfo}
              />
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/4 lg:pl-4">
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Related videos</h2>
            <div>
              {relatedVideos.map((video) => (
                <div className="mb-4" key={video.video_id}>
                  <VideoCard small video={video} key={video.video_id} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageBase>
  );
};

export default WatchPage;
