import React from "react";
import Head from "next/head";
import PageBase from "./shared/PageBase";
import Linkify from "react-linkify";
import { VideoMetadata } from "./shared/database";
import { DRIVE_BASE_URL } from "./shared/config";
import VideoPlayer from "./shared/VideoPlayer/VideoPlayer";
import { formatDate } from "./shared/format";
import ChatReplayPanel from "./shared/ChatReplayPanel";
import VideoCard from "./shared/VideoCard";
import Link from "next/link";
import ServiceUnavailablePage from "./ServiceUnavailablePage";
import VideoActionButtons from "./shared/VideoActionButtons";

const format = (n: number) => Intl.NumberFormat("en-US").format(n);

export type WatchPageProps = {
  videoInfo: VideoMetadata;
  hasChat: boolean;
  relatedVideos: VideoMetadata[];
  channelVideoCount: number;
};

const WatchPage = (props: WatchPageProps) => {
  if (!props.videoInfo) return <ServiceUnavailablePage />;

  const { videoInfo, hasChat, relatedVideos } = props;
  const videoBase =
    DRIVE_BASE_URL + "/" + videoInfo.video_id + "/" + videoInfo.video_id;
  const thumbURL = videoBase + ".webp";
  const chatURL = videoBase + ".chat.json";
  const channelBase = DRIVE_BASE_URL + "/" + videoInfo.channel_id;

  const [isChatVisible, setIsChatVisible] = React.useState(false);
  const refMobileScrollTarget = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isChatVisible)
      refMobileScrollTarget.current?.scrollIntoView({ behavior: "smooth" });
  }, [isChatVisible]);

  const [playbackProgress, setPlaybackProgress] = React.useState(0);
  const [fmtVideo, fmtAudio] = videoInfo.format_id.split("+");
  const urlVideo =
    DRIVE_BASE_URL +
    "/" +
    videoInfo.video_id +
    "/" +
    videoInfo.files.find((file) => file.name.includes(".f" + fmtVideo))?.name;
  const urlAudio =
    DRIVE_BASE_URL +
    "/" +
    videoInfo.video_id +
    "/" +
    videoInfo.files.find((file) => file.name.includes(".f" + fmtAudio))?.name;

  return (
    <PageBase>
      <Head>
        <title>{videoInfo.title} - Ragtag Archive</title>
        <meta name="title" content={videoInfo.title} />
        <meta name="description" content={videoInfo.channel_name} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ragtag Archive" />
        <meta
          property="og:url"
          content={"https://archive.ragtag.moe/watch?v=" + videoInfo.video_id}
        />
        <meta property="og:title" content={videoInfo.title} />
        <meta property="og:description" content={videoInfo.channel_name} />
        <meta property="og:image" content={thumbURL} />

        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content={"https://archive.ragtag.moe/watch?v=" + videoInfo.video_id}
        />
        <meta property="twitter:title" content={videoInfo.title} />
        <meta property="twitter:description" content={videoInfo.channel_name} />
        <meta property="twitter:image" content={thumbURL} />
      </Head>
      <div
        className={[
          "flex lg:flex-row flex-col lg:h-auto",
          isChatVisible ? "h-screen" : "",
        ].join(" ")}
      >
        <div className="w-full lg:w-3/4">
          <div className="lg:absolute lg:top-0" ref={refMobileScrollTarget} />
          <div className="relative bg-gray-400">
            <VideoPlayer
              key={urlVideo}
              srcVideo={urlVideo}
              srcAudio={urlAudio}
              srcPoster={thumbURL}
              captions={videoInfo.files
                .filter((file) => file.name.endsWith(".vtt"))
                .map(({ name }) => {
                  const lang = name.split(".")[1];
                  return {
                    lang,
                    src: DRIVE_BASE_URL + "/" + videoInfo.video_id + "/" + name,
                  };
                })}
              onPlaybackProgress={setPlaybackProgress}
            />
          </div>
        </div>
        <div
          className={[
            "w-full lg:w-1/4 lg:pl-4",
            isChatVisible ? "flex-1" : "",
          ].join(" ")}
        >
          {!hasChat ? (
            <div className="border border-gray-800 rounded p-4 text-center">
              <p>Chat replay unavailable</p>
            </div>
          ) : (
            <ChatReplayPanel
              src={chatURL}
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
              <p className="text-gray-400">
                {format(videoInfo.view_count)} views &middot; Uploaded{" "}
                {formatDate(new Date(videoInfo.upload_date))} &middot; Archived{" "}
                {formatDate(new Date(videoInfo.archived_timestamp))}
              </p>
              <div>
                <span className="text-green-500">
                  {format(videoInfo.like_count)} likes
                </span>{" "}
                /{" "}
                <span className="text-red-500">
                  {format(videoInfo.dislike_count)} dislikes
                </span>
              </div>
            </div>
            <div className="flex flex-row mt-2">
              <VideoActionButtons video={videoInfo} />
            </div>
            <div className="mt-4">
              <div className="inline-block">
                <Link href={"/channel/" + videoInfo.channel_id}>
                  <a className="mb-4 mb-4 hover:underline flex flex-row">
                    <img
                      alt="Channel thumbnail"
                      src={channelBase + "/profile.jpg"}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-4">
                      <p className="font-bold text-lg leading-tight">
                        {videoInfo.channel_name}
                      </p>
                      <span className="text-gray-400 leading-tight">
                        {props.channelVideoCount} videos
                      </span>
                    </div>
                  </a>
                </Link>
              </div>
              <div className="whitespace-pre-line break-words text-gray-300">
                <Linkify
                  componentDecorator={(href, text, key) => (
                    <a
                      key={key}
                      href={href}
                      className="text-blue-300 hover:underline focus:outline-none focus:underline"
                      target="_blank"
                      rel="noreferrer noopener nofollow"
                    >
                      {text}
                    </a>
                  )}
                >
                  {videoInfo.description}
                </Linkify>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/4 lg:pl-4">
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Related videos</h2>
            <div>
              {relatedVideos.map((video) => (
                <div className="mb-4">
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
