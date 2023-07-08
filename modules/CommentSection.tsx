import React from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { format } from 'timeago.js';
import LoaderRing from './shared/VideoPlayer/components/LoaderRing';
import { formatNumber } from './shared/format';
import ExpandableContainer from './ExpandableContainer';
import { NextImage } from './shared/NextImage';

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
  const [numberVisible, setNumberVisible] = React.useState(2);

  return (
    <div key={comment.id} className="flex py-4">
      <div className="rounded-full overflow-hidden w-12 h-12">
        <NextImage
          src={comment.author_thumbnail}
          alt=""
          layout="fixed"
          width={48}
          height={48}
        />
      </div>
      <div className="ml-4 flex-1">
        <div className="text-sm">
          <span>{comment.author}</span>
          <span className="ml-2 text-gray-400">
            {format(comment.timestamp * 1000)}
          </span>
        </div>
        <ExpandableContainer>
          <div className="whitespace-pre-line">{comment.text}</div>
        </ExpandableContainer>
        <div>
          {replies.slice(0, numberVisible).map((reply) => (
            <CommentPost key={reply.id} comment={reply} replies={[]} />
          ))}
          {numberVisible < replies.length && (
            <button
              type="button"
              className="font-bold text-blue-500 hover:underline"
              onClick={() => setNumberVisible((now) => now + 10)}
            >
              Show more replies
            </button>
          )}
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
    ['infojson', props.videoId],
    () => axios.get(props.infoJsonURL)
  );

  const [numberVisible, setNumberVisible] = React.useState(10);

  if (isLoading)
    return (
      <div
        style={{ transform: 'scale(0.5)' }}
        className="flex w-full items-center justify-center"
      >
        <LoaderRing />
      </div>
    );

  if (isError) return <div className="text-center">Error loading comments</div>;

  if (!('comments' in data.data))
    return <div className="text-center">Comments not available</div>;

  const comments = data.data.comments as Comment[];
  const rootComments = comments.filter((c) => c.parent === 'root');

  return (
    <div>
      <div className="font-bold">{formatNumber(comments.length)} comments</div>
      {rootComments.slice(0, numberVisible).map((comment) => (
        <CommentPost
          key={comment.id}
          comment={comment}
          replies={comments.filter((c) => c.parent === comment.id)}
        />
      ))}
      {numberVisible < rootComments.length && (
        <button
          type="button"
          className="bg-gray-900 text-white text-center w-full py-2 rounded"
          onClick={() => setNumberVisible((now) => now + 10)}
        >
          Show more
        </button>
      )}
    </div>
  );
};

export default CommentSection;
