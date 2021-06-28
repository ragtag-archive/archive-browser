import React from "react";
import Image from "next/image";
import axios from "axios";
import { useQuery } from "react-query";
import { proxyYT3 } from "./shared/util";
import { format } from "timeago.js";
import LoaderRing from "./shared/VideoPlayer/components/LoaderRing";
import { formatNumber } from "./shared/format";

type Comment = {
  id: string;
  text: string;
  timestamp: number;
  time_text: string;
  like_count: number;
  is_favorited: boolean;
  author: string;
  author_id: string;
  author_thumbnail: string;
  author_is_uploader: boolean;
  parent: string;
};

type CommentPostProps = {
  comment: Comment;
  replies: Comment[];
};

const CommentPost = (props: CommentPostProps) => {
  const { comment, replies } = props;

  return (
    <div key={comment.id} className="flex py-4">
      <div className="rounded-full overflow-hidden w-12 h-12">
        <Image
          src={proxyYT3(comment.author_thumbnail)}
          layout="fixed"
          width={48}
          height={48}
          unoptimized
        />
      </div>
      <div className="ml-4 flex-1">
        <div className="text-sm">
          <span>{comment.author}</span>
          <span className="ml-2 text-gray-400">
            {format(comment.timestamp * 1000)}
          </span>
        </div>
        <div className="whitespace-pre-line">{comment.text}</div>
        <div>
          {replies.map((reply) => (
            <CommentPost comment={reply} replies={[]} />
          ))}
        </div>
      </div>
    </div>
  );
};

type CommentSectionProps = {
  videoId?: string;
  infoJsonURL: string;
};

const CommentSection = (props: CommentSectionProps) => {
  const { isLoading, isError, data } = useQuery(
    ["infojson", props.videoId],
    () => axios.get(props.infoJsonURL)
  );

  if (isLoading)
    return (
      <div
        style={{ transform: "scale(0.5)" }}
        className="flex w-full items-center justify-center"
      >
        <LoaderRing />
      </div>
    );

  if (isError) return <div className="text-center">Error loading comments</div>;

  if (!("comments" in data.data))
    return <div className="text-center">Comments not available</div>;

  const comments = data.data.comments as Comment[];
  return (
    <div>
      <div className="font-bold">{formatNumber(comments.length)} comments</div>
      {comments
        .filter((c) => c.parent === "root")
        .map((comment) => (
          <CommentPost
            key={comment.id}
            comment={comment}
            replies={comments.filter((c) => c.parent === comment.id)}
          />
        ))}
    </div>
  );
};

export default CommentSection;
