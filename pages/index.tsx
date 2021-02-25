import { GetStaticProps } from "next";
import LandingPage from "../modules/LandingPage";
import { apiSearch } from "./api/search";

export const getStaticProps: GetStaticProps = async (ctx) => {
  const results = await apiSearch({
    q: "",
    sort: "archived_timestamp",
    sort_order: "desc",
  });
  return { props: { videos: results.data }, revalidate: 60 };
};

export default LandingPage;
