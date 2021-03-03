import React from "react";
import Head from "next/head";
import PageBase from "./shared/PageBase";
import Linkify from "react-linkify";
import { VideoMetadata } from "./shared/database";
import { DRIVE_BASE_URL } from "./shared/config";
import VideoPlayer from "./shared/VideoPlayer";
import { formatBytes, formatDate } from "./shared/format";
import ChatReplayPanel from "./shared/ChatReplayPanel";
import VideoCard from "./shared/VideoCard";
import Link from "next/link";
import { IconDownload, IconYouTube } from "./shared/icons";
import ServiceUnavailablePage from "./ServiceUnavailablePage";

const format = (n: number) => Intl.NumberFormat("en-US").format(n);

export type WatchPageProps = {
  videoInfo: VideoMetadata;
  hasChat: boolean;
  relatedVideos: VideoMetadata[];
};

const WatchPage = (props: WatchPageProps) => {
  if (!props.videoInfo) return <ServiceUnavailablePage />;

  const { videoInfo, hasChat, relatedVideos } = props;
  const videoBase =
    DRIVE_BASE_URL + "/" + videoInfo.video_id + "/" + videoInfo.video_id;
  const thumbURL = videoBase + ".webp";
  const chatURL = videoBase + ".chat.json";
  const mkvURL = videoBase + ".mkv";
  const mkvSize =
    videoInfo.files.find(({ name }) => name.endsWith(".mkv"))?.size || -1;

  const [playbackProgress, setPlaybackProgress] = React.useState(0);
  const [fmtVideo, fmtAudio] = videoInfo.format_id.split("+");
  const urlVideo =
    DRIVE_BASE_URL +
    "/" +
    videoInfo.video_id +
    "/" +
    videoInfo.files.find((file) => file.name.includes(".f" + fmtVideo)).name;
  const urlAudio =
    DRIVE_BASE_URL +
    "/" +
    videoInfo.video_id +
    "/" +
    videoInfo.files.find((file) => file.name.includes(".f" + fmtAudio)).name;

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
      <div className="flex md:flex-row flex-col">
        <div className={"w-full md:w-3/4"}>
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
          <div className="mt-4 mx-6">
            {!!videoInfo ? (
              <>
                <h1 className="text-2xl mb-2">{videoInfo.title}</h1>
                <div className="flex flex-row justify-between">
                  <p className="text-gray-400">
                    {format(videoInfo.view_count)} views &middot; Uploaded{" "}
                    {formatDate(new Date(videoInfo.upload_date))} &middot;
                    Archived{" "}
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
                  <a
                    href={mkvURL}
                    className="
                      bg-gray-800
                      hover:bg-gray-700
                      focus:bg-gray-900 focus:outline-none
                      px-4 py-2 mr-2 rounded
                      transition duration-200
                      flex flex-row items-center
                    "
                  >
                    <IconDownload className="w-4 h-4 mr-3" />
                    Download ({formatBytes(mkvSize)})
                  </a>
                  <a
                    href={"https://youtu.be/" + videoInfo.video_id}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="
                      bg-gray-800
                      hover:bg-gray-700
                      focus:bg-gray-900 focus:outline-none
                      px-4 py-2 mr-2 rounded
                      transition duration-200
                      flex flex-row items-center
                    "
                  >
                    <IconYouTube className="w-4 h-4 mr-3" />
                    Watch on YouTube
                  </a>
                </div>
                <div className="mt-4">
                  <Link href={"/channel/" + videoInfo.channel_id}>
                    <a className="mb-4 font-bold text-lg inline-block mb-4 hover:underline">
                      {videoInfo.channel_name}
                    </a>
                  </Link>
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
              </>
            ) : (
              <>
                <h2 className="text-xl bg-gray-800 animate-pulse w-1/3">
                  &nbsp;
                </h2>
                <div className="bg-gray-800 animate-pulse w-full h-16 mt-2">
                  &nbsp;
                </div>
              </>
            )}
          </div>
        </div>
        <div className="w-full md:w-1/4 md:pl-4">
          {!hasChat ? (
            <div className="border border-gray-800 rounded p-4 text-center">
              <p>Chat replay unavailable</p>
            </div>
          ) : (
            <ChatReplayPanel
              src={chatURL}
              currentTimeSeconds={playbackProgress}
            />
          )}
          <div className="mt-6">
            <h4 className="text-xl font-bold mb-2">Related videos</h4>
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
