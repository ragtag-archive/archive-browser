import { GetServerSideProps } from "next";
import ChannelPage, { ChannelPageProps } from "../../modules/ChannelPage";
import {
  ElasticSearchResult,
  VideoMetadata,
} from "../../modules/shared/database";
import { apiSearch } from "../api/v1/search";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const channelId = ctx.params.channelId as string;
  const page = Number(ctx.query.page as string) || 1;
  const size = 25;
  const from = (page - 1) * size;
  const results = (
    await apiSearch({
      channel_id: channelId,
      from,
      size,
      sort: "upload_date",
      sort_order: "desc",
    })
  ).data as ElasticSearchResult<VideoMetadata>;

  if (results.hits.total.value === 0) return { notFound: true };

  const props: ChannelPageProps = {
    channelId,
    channelName: results.hits.hits[0]._source.channel_name,

    results,
    page,
    from,
    size,
  };

  return { props };
};

export default ChannelPage;
