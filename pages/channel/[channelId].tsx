import { GetServerSideProps, GetStaticPaths } from 'next';
import ChannelPage, { ChannelPageProps } from '../../modules/ChannelPage';
import { DRIVE_BASE_URL } from '../../modules/shared/config';
import {
  ElasticSearchResult,
  VideoMetadata,
} from '../../modules/shared/database.d';
import { signFileURLs, signURL } from '../../modules/shared/fileAuth';
import { apiSearch } from '../api/v1/search';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const channelId = ctx.params.channelId as string;
  const page = Number(ctx.query.page as string) || 1;
  const size = 24;
  const from = (page - 1) * size;
  const results = (
    await apiSearch({
      channel_id: channelId,
      from,
      size,
      sort: 'upload_date',
      sort_order: 'desc',
    })
  ).data as ElasticSearchResult<VideoMetadata>;

  if (results.hits.total.value === 0) return { notFound: true };

  const channel = results.hits.hits[0]._source;
  results.hits.hits.forEach((hit) =>
    signFileURLs(hit._source.drive_base, hit._source.files, '')
  );

  const props: ChannelPageProps = {
    channelId,
    channelName: channel.channel_name,
    channelImageURL: signURL(
      DRIVE_BASE_URL + '/' + channel.channel_id + '/profile.jpg',
      ''
    ),

    results,
    page,
    from,
    size,
  };

  return { props };
};

export default ChannelPage;
