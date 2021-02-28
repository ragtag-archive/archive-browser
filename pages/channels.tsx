import { GetStaticProps } from "next";
import ChannelsListPage from "../modules/ChannelsListPage";
import { apiListChannels } from "./api/v1/channels";

export const getStaticProps: GetStaticProps = async (context) => {
  for (let tries = 0; tries < 5; tries++) {
    try {
      const channels = await apiListChannels();
      return { props: { channels }, revalidate: 60 };
    } catch (ex) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return { props: {}, revalidate: 60 };
};

export default ChannelsListPage;
