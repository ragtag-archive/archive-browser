import { GetStaticProps } from "next";
import LandingPage from "../modules/LandingPage";
import { apiSearch, apiStorageStatistics } from "./api/search";

export const getStaticProps: GetStaticProps = async (ctx) => {
  const [results, stats] = await Promise.all([
    apiSearch({
      q: "",
      sort: "archived_timestamp",
      sort_order: "desc",
    }),
    apiStorageStatistics(),
  ]);
  return { props: { videos: results.data, stats }, revalidate: 60 };
};

export default LandingPage;
