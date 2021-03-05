import React from "react";
import { DRIVE_BASE_URL } from "./config";
import { VideoMetadata } from "./database";
import { formatBytes } from "./format";
import { IconDownload, IconYouTube } from "./icons";

type VideoActionButtonsProps = {
  video: VideoMetadata;
};

const VideoActionButtons = ({ video }: VideoActionButtonsProps) => {
  const videoBase =
    DRIVE_BASE_URL + "/" + video?.video_id + "/" + video?.video_id;
  const mkvURL = videoBase + ".mkv";
  const mkvSize =
    video.files?.find(({ name }) => name.endsWith(".mkv"))?.size || -1;

  return (
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
        Download ({video.height}p{video.fps}, {formatBytes(mkvSize)})
      </a>
      <a
        href={"https://youtu.be/" + video.video_id}
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
  );
};

export default VideoActionButtons;
