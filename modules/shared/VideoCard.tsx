import React from "react";
import Link from "next/link";
import { VideoMetadata } from "./database";
import { formatDate, formatSeconds } from "./format";
import { format } from "timeago.js";
import VideoActionButtons from "./VideoActionButtons";

export type VideoCardProps = {
  video?: VideoMetadata;
  small?: boolean;
};

const VideoCard = React.memo(({ video, small }: VideoCardProps) => {
  const thumbURL = video?.files?.find((file) => file.name.endsWith(".webp"))
    ?.url;

  return (
    <div
      className={["flex", small ? "flex-col" : "flex-col md:flex-row"].join(
        " "
      )}
    >
      <div className={small ? "w-full" : "md:w-1/4 w-full py-2"}>
        <Link href={video ? "/watch?v=" + video?.video_id : ""}>
          <a tabIndex={-1}>
            <div
              className="w-full h-0 relative"
              style={{ paddingBottom: "56.25%" }}
            >
              <div className="bg-gray-800 animate-pulse absolute inset-0" />
              {!!video && (
                <img
                  src={thumbURL}
                  className="absolute inset-0 w-full h-full"
                  alt="Video thumbnail"
                />
              )}
              <div className="absolute right-0 bottom-0 bg-black text-white px-2 bg-opacity-75 rounded m-2">
                {formatSeconds(video?.duration || 0)}
              </div>
            </div>
          </a>
        </Link>
      </div>
      <div className={small ? "py-2 md:px-0 px-4" : "flex-1 px-4 py-2"}>
        {!!video ? (
          <>
            <Link href={video ? "/watch?v=" + video?.video_id : ""}>
              <a>
                <h2 className={["font-bold", small ? "" : "text-xl"].join(" ")}>
                  {video.title}
                </h2>
              </a>
            </Link>
            <Link href={"/channel/" + video.channel_id}>
              <a
                className={[
                  "text-gray-400 hover:text-white hover:underline inline-block",
                  "transition duration-200",
                  small && "text-sm",
                ].join(" ")}
              >
                {video.channel_name}
              </a>
            </Link>
            <p className={["text-gray-400", small && "text-sm"].join(" ")}>
              {Intl.NumberFormat("en-US").format(video.view_count)} views
              &middot; Uploaded {formatDate(new Date(video.upload_date))}{" "}
              &middot; Archived{" "}
              {format(
                video.archived_timestamp +
                  (video.archived_timestamp.endsWith("Z") ? "" : "Z"),
                "en_US"
              )}
            </p>
            {!small && <VideoActionButtons video={video} />}
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
});

export default VideoCard;
