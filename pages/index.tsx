import { GetServerSideProps } from "next";
import LandingPage from "../modules/LandingPage";
import { signFileURLs } from "../modules/shared/fileAuth";
import { getRemoteAddress } from "../modules/shared/util";
import { apiGetPopularVideos } from "./api/pv";
import { apiSearch, apiStorageStatistics } from "./api/v1/search";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const [stats, vRecentArchive, vRecentUpload, vPopular] = await Promise.all([
      apiStorageStatistics(),
      apiSearch({
        q: "",
        sort: "archived_timestamp",
        sort_order: "desc",
        size: 8,
      }),
      apiSearch({
        q: "",
        sort: "upload_date",
        sort_order: "desc",
        size: 12,
      }),
      apiGetPopularVideos(),
    ]);

    const ip = getRemoteAddress(ctx.req);
    vRecentArchive.data.hits.hits.forEach((hit) =>
      signFileURLs(hit._source.drive_base, hit._source.files, ip)
    );
    vRecentUpload.data.hits.hits.forEach((hit) =>
      signFileURLs(hit._source.drive_base, hit._source.files, ip)
    );
    vPopular.hits.hits.forEach((hit) =>
      signFileURLs(hit._source.drive_base, hit._source.files, ip)
    );

    const sections = [];
    sections.push({ title: "Trending videos", videos: vPopular });
    sections.push({ title: "Recently uploaded", videos: vRecentUpload.data });
    sections.push({
      title: "Recently archived",
      videos: vRecentArchive.data,
    });

    return { props: { videos: sections, stats } };
  } catch (ex) {
    console.error(ex);
  }
  return { props: {} };
};

export default LandingPage;
