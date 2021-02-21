import { GetServerSideProps } from "next";
import { ElasticSearchResult, VideoMetadata } from "../modules/shared/database";
import WatchPage, { WatchPageProps } from "../modules/WatchPage";
import { apiSearch } from "./api/search";
import { apiVideo } from "./api/video";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const v = ctx.query.v as string;

    if (!v) return { notFound: true };

    const [searchResult, fileListResult] = await Promise.all([
      apiSearch({ v }),
      apiVideo({ v }),
    ]);

    const _searchResult = searchResult.data as ElasticSearchResult<VideoMetadata>;
    if (_searchResult.hits.total.value === 0) return { notFound: true };
    const videoInfo = _searchResult.hits.hits[0]._source;

    const related = (
      await apiSearch({
        more_like_this: {
          title: videoInfo.title,
          description: videoInfo.description,
          channel_name: videoInfo.channel_name,
        },
      })
    ).data as ElasticSearchResult<VideoMetadata>;

    const props: WatchPageProps = {
      videoInfo,
      fileList: fileListResult.urls,
      hasChat: fileListResult.urls.includes("/" + v + "/" + v + ".chat.json"),
      relatedVideos: related.hits.hits
        .map((hit) => hit._source)
        .filter((video) => video.video_id !== v),
    };

    return { props };
  } catch (ex) {
    return { notFound: true };
  }
};

export default WatchPage;
