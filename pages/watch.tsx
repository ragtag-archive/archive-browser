import { GetServerSideProps } from "next";
import { ElasticSearchResult, VideoMetadata } from "../modules/shared/database";
import WatchPage from "../modules/WatchPage/WatchPage";
import { apiSearch } from "./api/search";
import { apiVideo } from "./api/video";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const v = ctx.query.v as string;

  if (!v) return { notFound: true };

  const [searchResult, fileListResult] = await Promise.all([
    apiSearch({ v }),
    apiVideo({ v }),
  ]);

  const _searchResult = searchResult.data as ElasticSearchResult<VideoMetadata>;

  if (_searchResult.hits.total.value === 0) return { notFound: true };

  const videoInfo = _searchResult.hits.hits[0]._source;
  const fileList = fileListResult.urls;

  return {
    props: {
      videoInfo,
      fileList,
    },
  };
};

export default WatchPage;
