import { GetServerSideProps } from 'next';
import { signFileURLs } from '../../modules/shared/fileAuth';
import { getRemoteAddress } from '../../modules/shared/util';
import VideoEmbedPage, {
  VideoEmbedPageProps,
} from '../../modules/VideoEmbedPage';
import { apiSearch } from '../api/v1/search';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const v = (ctx.params.videoId as string).trim();

  if (!v) return { notFound: true };

  // Query for video info
  const videoQuery = await apiSearch({ v });
  if (videoQuery.data.hits.total.value === 0) return { notFound: true };
  const videoInfo = videoQuery.data.hits.hits[0]._source;

  // Sign URLs
  const ip = getRemoteAddress(ctx.req);
  signFileURLs(videoInfo.drive_base, videoInfo.files, ip);

  const props: VideoEmbedPageProps = {
    videoInfo,
  };
  return { props };
};

export default VideoEmbedPage;
