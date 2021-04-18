import React from "react";
import { VideoMetadata } from "./database.d";
import { formatBytes } from "./format";
import { IconDownload, IconEllipsisV, IconYouTube } from "./icons";
import {
  K_AMPLITUDE_EVENT_VIDEO_BUTTON_MORE_DOWNLOADS,
  K_AMPLITUDE_EVENT_VIDEO_DOWNLOAD,
} from "./libs/amplitude/constants";
import { useAmplitude } from "./libs/amplitude/useAmplitude";

type VideoActionButtonsProps = {
  video: VideoMetadata;
};

export const buttonStyle = `
  bg-gray-800
  hover:bg-gray-700
  focus:bg-gray-900 focus:outline-none
  px-4 py-2 md:mr-2 mb-2 md:mb-0 rounded
  transition duration-200
  flex flex-row items-center`.replace(/\s+/, " ");

const getFile = (videoInfo: VideoMetadata, suffix: string) =>
  videoInfo.files.find((file) => file.name.endsWith(suffix));

const VideoActionButtons = React.memo(({ video }: VideoActionButtonsProps) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { logEvent } = useAmplitude();

  const mkv = getFile(video, ".mkv");
  const mkvURL = mkv?.url;
  const mkvSize = mkv?.size || -1;

  const [fmtVideo, fmtAudio] = video.format_id.split("+");

  const handleToggleMenu = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    setIsMenuOpen((now) => !now);
    logEvent(K_AMPLITUDE_EVENT_VIDEO_BUTTON_MORE_DOWNLOADS, {
      videoId: video.video_id,
    });
  };

  const fileURLs = video.files
    ?.filter(({ name }) => !name.endsWith(".mkv"))
    .map(({ name, size, url }) => ({
      label: name.includes(".f" + fmtVideo + ".")
        ? "Video only"
        : name.includes(".f" + fmtAudio + ".")
        ? "Audio only"
        : name.endsWith(".vtt")
        ? "Captions (vtt, " + name.split(".")[1] + ")"
        : name.endsWith(".ytt")
        ? "Captions (srv3, " + name.split(".")[1] + ")"
        : name.endsWith(".chat.json")
        ? "Chat logs (json)"
        : name.endsWith(".info.json")
        ? "Metadata (json)"
        : name.endsWith(".webp")
        ? "Thumbnail (webp)"
        : name.endsWith(".jpg")
        ? "Thumbnail (jpeg)"
        : name,
      name,
      size,
      url,
    }))
    .sort((a, b) => (a.label > b.label ? 1 : -1));

  // Account for aspect ratio wider than 16:9
  const videoHeight = Math.max(video.height, 0.5625 * video.width);

  return (
    <>
      {isMenuOpen && (
        <div
          className="fixed inset-0 opacity-0"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div className="relative flex md:flex-row flex-col md:w-auto w-full mt-2">
        <a
          href="#"
          className={buttonStyle}
          onClick={handleToggleMenu}
          aria-label="More download options"
        >
          <IconEllipsisV className="w-4 h-4" />
          <span className="md:hidden ml-3">More download options</span>
        </a>
        {isMenuOpen && (
          <div className="absolute z-10 left-0 top-10 bg-gray-800 rounded overflow-hidden">
            {fileURLs.map((file) => (
              <a
                key={file.name}
                href={file.url}
                target="_blank"
                rel="noreferrer noopener nofollow"
                className="hover:bg-gray-700 focus:bg-gray-900 focus:outline-none block px-4 py-2 transition duration-200"
                onClick={() => {
                  logEvent(K_AMPLITUDE_EVENT_VIDEO_DOWNLOAD, {
                    videoId: video.video_id,
                    fileName: file.name,
                    fileExtension: file.name.split(".").pop(),
                  });
                }}
              >
                {file.label}
              </a>
            ))}
          </div>
        )}
        <a
          href={mkvURL}
          className={buttonStyle}
          onClick={() => {
            logEvent(K_AMPLITUDE_EVENT_VIDEO_DOWNLOAD, {
              videoId: video.video_id,
              fileName: video.video_id + ".mkv",
              fileExtension: "mkv",
            });
          }}
        >
          <IconDownload className="w-4 h-4 mr-3" />
          Download ({videoHeight}p{video.fps}, {formatBytes(mkvSize)})
        </a>
        <a
          href={"https://youtu.be/" + video.video_id}
          target="_blank"
          rel="noreferrer noopener"
          className={buttonStyle}
        >
          <IconYouTube className="w-4 h-4 mr-3" />
          Watch on YouTube
        </a>
      </div>
    </>
  );
});

export default VideoActionButtons;
