import React from "react";
import { DRIVE_BASE_URL } from "./config";
import { VideoMetadata } from "./database";
import { formatBytes } from "./format";
import { IconDownload, IconEllipsisV, IconYouTube } from "./icons";

type VideoActionButtonsProps = {
  video: VideoMetadata;
};

export const buttonStyle = `
  bg-gray-800
  hover:bg-gray-700
  focus:bg-gray-900 focus:outline-none
  px-4 py-2 md:mr-2 mb-2 md:mb-0 rounded
  transition duration-200
  flex flex-row items-center`;

const VideoActionButtons = ({ video }: VideoActionButtonsProps) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const videoBase =
    DRIVE_BASE_URL + "/" + video?.video_id + "/" + video?.video_id;
  const mkvURL = videoBase + ".mkv";
  const mkvSize =
    video.files?.find(({ name }) => name.endsWith(".mkv"))?.size || -1;

  const [fmtVideo, fmtAudio] = video.format_id.split("+");

  const handleToggleMenu = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    setIsMenuOpen((now) => !now);
  };

  const fileURLs = video.files
    ?.filter(({ name }) => !name.endsWith(".mkv"))
    .map(({ name, size }) => ({
      label: name.includes(".f" + fmtVideo + ".")
        ? "Video only"
        : name.includes(".f" + fmtAudio + ".")
        ? "Audio only"
        : name.endsWith(".vtt")
        ? "Captions (" + name.split(".")[1] + ")"
        : name.endsWith(".chat.json")
        ? "Chat logs (JSON)"
        : name.endsWith(".info.json")
        ? "Metadata (JSON)"
        : name.endsWith(".webp")
        ? "Thumbnail (webp)"
        : name.endsWith(".jpg")
        ? "Thumbnail (jpeg)"
        : name,
      name,
      size,
    }))
    .sort((a, b) => (a.label > b.label ? 1 : -1));

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
                href={DRIVE_BASE_URL + "/" + video.video_id + "/" + file.name}
                target="_blank"
                rel="noreferrer noopener nofollow"
                className="hover:bg-gray-700 focus:bg-gray-900 focus:outline-none block px-4 py-2 transition duration-200"
              >
                {file.label}
              </a>
            ))}
          </div>
        )}
        <a href={mkvURL} className={buttonStyle}>
          <IconDownload className="w-4 h-4 mr-3" />
          Download ({video.height}p{video.fps}, {formatBytes(mkvSize)})
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
};

export default VideoActionButtons;
