import React from "react";
import Head from "next/head";
import PageBase from "../shared/PageBase";
import { VideoMetadata } from "../shared/database";
import { DRIVE_BASE_URL } from "../shared/config";

const format = (n: number) => Intl.NumberFormat("en-US").format(n);

type WatchPageProps = {
  videoInfo: VideoMetadata;
  fileList: string[];
};

const WatchPage = ({ videoInfo, fileList }: WatchPageProps) => {
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
        <div className="md:w-3/4 w-full">
          <div
            className="w-full h-0 relative"
            style={{ paddingBottom: "56.25%" }}
          >
            {!!urlVideo && !!urlAudio ? (
              <>
                <video
                  ref={refVideo}
                  controls
                  poster={thumbURL}
                  onPlay={() => refAudio.current?.play()}
                  onPause={() => refAudio.current?.pause()}
                  onWaiting={() => refAudio.current?.pause()}
                  onTimeUpdate={() => {
                    if (!refAudio.current || !refVideo.current) return;

                    // Resync if more than 100ms off
                    if (
                      Math.abs(
                        refAudio.current.currentTime -
                          refVideo.current.currentTime
                      ) > 0.1
                    )
                      refAudio.current.currentTime =
                        refVideo.current.currentTime;

                    try {
                      if (refVideo.current.paused) refAudio.current.pause();
                      else refAudio.current.play();
                    } catch (ex) {}
                  }}
                >
                  <source src={urlVideo} />
                  {fileList
                    .filter((file) => file.endsWith(".vtt"))
                    .map((file) => {
                      const lang = file.split(".")[1];
                      const url =
                        "/api/captions?v=" +
                        videoInfo.video_id +
                        "&lang=" +
                        lang;
                      return (
                        <track
                          key={lang}
                          kind="subtitles"
                          label={lang}
                          srcLang={lang}
                          src={url}
                          default={lang === "en" || lang === "en-US"}
                        />
                      );
                    })}
                </video>
                <audio ref={refAudio}>
                  <source src={urlAudio} />
                </audio>
              </>
            ) : (
              <div className="bg-gray-800 animate-pulse absolute inset-0" />
            )}
          </div>
          <div className="mt-4 md:mx-0 mx-6">
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
        <div className="w-1/4">
          <h4>Chat replay (coming soon)</h4>
        </div>
      </div>
    </PageBase>
  );
};

export default WatchPage;
