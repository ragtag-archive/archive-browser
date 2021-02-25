import { GetStaticProps } from "next";
import ChannelsListPage from "../modules/ChannelsListPage";
import { apiListChannels } from "./api/search";

export const getStaticProps: GetStaticProps = async (context) => {
  const channels = await apiListChannels();
  return { props: { channels }, revalidate: 60 };
};

export default ChannelsListPage;
