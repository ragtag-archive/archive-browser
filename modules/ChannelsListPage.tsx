import Link from "next/link";
import { AggregatedChannel } from "../pages/api/search";
import PageBase from "./shared/PageBase";

export type ChannelsListPageProps = {
  channels: AggregatedChannel[];
};

const ChannelsListPage = (props: ChannelsListPageProps) => {
  const { channels } = props;

  return (
    <PageBase>
      <div className="">
        {channels.map((channel) => (
          <Link
            key={channel.channel_id}
            href={"/channel/" + channel.channel_id}
          >
            <a className="block border border-gray-800 mb-4 p-6 rounded">
              <strong className="text-lg">{channel.channel_name}</strong>
              <p>{channel.videos_count} videos</p>
            </a>
          </Link>
        ))}
      </div>
    </PageBase>
  );
};

export default ChannelsListPage;
