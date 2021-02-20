import Link from "next/link";
import { DRIVE_BASE_URL } from "./config";
import { VideoMetadata } from "./database";

export type VideoCardProps = {
  video?: VideoMetadata;
};

const VideoCard = ({ video }: VideoCardProps) => {
  const videoBase =
    DRIVE_BASE_URL + "/" + video?.video_id + "/" + video?.video_id;
  const thumbURL = videoBase + ".webp";
  const mkvURL = videoBase + ".mkv";

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/4 w-full py-2">
        <Link href={video ? "/watch?v=" + video?.video_id : ""}>
          <a tabIndex={-1}>
            <div
              className="w-full h-0 relative"
              style={{ paddingBottom: "56.25%" }}
            >
              <div className="bg-gray-800 animate-pulse absolute inset-0" />
              {!!video && <img src={thumbURL} className="absolute inset-0" />}
            </div>
          </a>
        </Link>
      </div>
      <div className="flex-1 px-4 py-2">
        {!!video ? (
          <>
            <Link href={video ? "/watch?v=" + video?.video_id : ""}>
              <a>
                <div>
                  <h2 className="font-bold text-xl">{video.title}</h2>
                  <h3>{video.channel_name}</h3>
                  <p>{video.description.substr(0, 100)}...</p>
                </div>
              </a>
            </Link>
            <div className="flex flex-row mt-2">
              <a href={mkvURL} className="block bg-blue-500 px-4 py-2 rounded">
                Download .mkv
              </a>
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-xl bg-gray-800 animate-pulse w-1/3">&nbsp;</h2>
            <div className="bg-gray-800 animate-pulse w-full h-16 mt-2">
              &nbsp;
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
