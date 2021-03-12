import { GetServerSideProps } from "next";
import ChannelsListPage from "../modules/ChannelsListPage";
import { DRIVE_BASE_URL } from "../modules/shared/config";
import { signURL } from "../modules/shared/fileAuth";
import { getRemoteAddress } from "../modules/shared/util";
import { apiListChannels } from "./api/v1/channels";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const channels = await apiListChannels();
    channels.forEach(
      (channel) =>
        (channel.image_url = signURL(
          DRIVE_BASE_URL + "/" + channel.channel_id + "/profile.jpg",
          getRemoteAddress(ctx.req)
        ))
    );
    return { props: { channels } };
  } catch (ex) {
    console.error(ex);
  }
  return { props: {} };
};

export default ChannelsListPage;
