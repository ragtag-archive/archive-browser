import React from "react";
import Head from "next/head";
import PageBase from "../shared/PageBase";
import { VideoMetadata } from "../shared/database";
import { DRIVE_BASE_URL } from "../shared/config";
import VideoPlayer from "../shared/VideoPlayer";

const format = (n: number) => Intl.NumberFormat("en-US").format(n);

export type WatchPageProps = {
  videoInfo: VideoMetadata;
  fileList: string[];
  hasChat: boolean;
};

const WatchPage = ({ videoInfo, fileList, hasChat }: WatchPageProps) => {
  const refVideo = React.useRef<HTMLVideoElement>(null);
  const refAudio = React.useRef<HTMLAudioElement>(null);

  const videoBase =
    DRIVE_BASE_URL + "/" + videoInfo.video_id + "/" + videoInfo.video_id;
  const mkvURL = videoBase + ".mkv";
  const thumbURL = videoBase + ".webp";

  const [fmtVideo, fmtAudio] = videoInfo.format_id.split("+");
  const urlVideo =
    DRIVE_BASE_URL + fileList.find((file) => file.includes(".f" + fmtVideo));
  const urlAudio =
    DRIVE_BASE_URL + fileList.find((file) => file.includes(".f" + fmtAudio));

  return (
    <PageBase>
      <Head>
        <title>{videoInfo.title} - Ragtag Archive</title>
        <meta name="title" content={videoInfo.title} />
        <meta
          name="description"
          content={videoInfo.description.substr(0, 160)}
        />

        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={"https://archive.ragtag.moe/watch?v=" + videoInfo.video_id}
        />
        <meta property="og:title" content={videoInfo.title} />
        <meta
          property="og:description"
          content={videoInfo.description.substr(0, 160)}
        />
        <meta property="og:image" content={thumbURL} />

        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content={"https://archive.ragtag.moe/watch?v=" + videoInfo.video_id}
        />
        <meta property="twitter:title" content={videoInfo.title} />
        <meta
          property="twitter:description"
          content={videoInfo.description.substr(0, 160)}
        />
        <meta property="twitter:image" content={thumbURL} />
      </Head>
      <div className="flex md:flex-row flex-col">
        <div className={"w-full " + (hasChat ? "md:w-3/4" : "")}>
          <VideoPlayer
            srcVideo={urlVideo}
            srcAudio={urlAudio}
            srcPoster={thumbURL}
            captions={fileList
              .filter((file) => file.endsWith(".vtt"))
              .map((path) => {
                const lang = path.split(".")[1];
                return {
                  lang,
                  src:
                    "/api/captions?v=" + videoInfo.video_id + "&lang=" + lang,
                };
              })}
          />
          <div className="mt-4 mx-6">
            {!!videoInfo ? (
              <>
                <div className="flex md:flex-row flex-col">
                  <div className="flex-1">
                    <h1 className="text-2xl mb-2">{videoInfo.title}</h1>
                    <h2 className="mb-4">{videoInfo.channel_name}</h2>
                    <div className="flex flex-row justify-between mb-4">
                      <p>
                        {format(videoInfo.view_count)} views /{" "}
                        <span className="text-green-500">
                          {format(videoInfo.like_count)} likes
                        </span>{" "}
                        /{" "}
                        <span className="text-red-500">
                          {format(videoInfo.dislike_count)} dislikes
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <a
                      href={mkvURL}
                      className="block bg-blue-500 px-4 py-2 rounded mb-4"
                    >
                      Download .mkv
                    </a>
                  </div>
                </div>
                <p className="whitespace-pre-line break-words">
                  {videoInfo.description}
                </p>
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
        {hasChat && (
          <div className="w-1/4">
            <h4>Chat replay (coming soon)</h4>
          </div>
        )}
      </div>
    </PageBase>
  );
};

export default WatchPage;
