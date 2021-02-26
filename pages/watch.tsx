import { GetServerSideProps } from "next";
import { ElasticSearchResult, VideoMetadata } from "../modules/shared/database";
import WatchPage, { WatchPageProps } from "../modules/WatchPage";
import { apiRelatedVideos, apiSearch } from "./api/search";
import { apiVideo } from "./api/video";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const v = ctx.query.v as string;

    if (!v) return { notFound: true };

    const [searchResult, related] = await Promise.all([
      apiSearch({ v }),
      apiRelatedVideos(v),
    ]);
    const _searchResult = searchResult.data as ElasticSearchResult<VideoMetadata>;
    if (_searchResult.hits.total.value === 0) return { notFound: true };
    const videoInfo = _searchResult.hits.hits[0]._source;

    const files = Array.isArray(videoInfo.files)
      ? videoInfo.files
      : await apiVideo({ v }).then(({ urls }) =>
          urls
            .map((url) => ({ name: url.split("/")[2], size: -1 }))
            .filter((file) => !!file.name)
        );

    const props: WatchPageProps = {
      videoInfo: {
        ...videoInfo,
        files,
      },
      hasChat: !!files.find((file) => file.name === v + ".chat.json"),
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
