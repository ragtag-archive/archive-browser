import { DRIVE_BASE_URL } from "./config";
import { VideoMetadata } from "./database";

export type VideoCardProps = {
  video: VideoMetadata;
};

const VideoCard = ({ video }: VideoCardProps) => {
  const videoBase =
    DRIVE_BASE_URL + "/" + video.video_id + "/" + video.video_id;
  const thumbURL = videoBase + ".webp";
  const mkvURL = videoBase + ".mkv";

  return (
    <div className="flex flex-row py-2">
      <div className="w-1/4">
        <img src={thumbURL} />
      </div>
      <div className="flex-1 px-4">
        <div>
          <h2 className="font-bold text-xl">{video.title}</h2>
          <h3>{video.channel_name}</h3>
          <p>{video.description.substr(0, 100)}...</p>
        </div>
        <div className="flex flex-row mt-2">
          <a href={mkvURL} className="block bg-blue-500 px-4 py-2 rounded">
            Download .mkv
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
