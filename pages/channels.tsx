import { GetServerSideProps } from 'next';
import ChannelsListPage from '../modules/ChannelsListPage';
import { DRIVE_BASE_URL } from '../modules/shared/config';
import { signURL } from '../modules/shared/fileAuth';
import { apiListChannels } from './api/v1/channels';

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const channels = await apiListChannels();
    channels.forEach(
      (channel) =>
        (channel.image_url = signURL(
          DRIVE_BASE_URL + '/' + channel.channel_id + '/profile.jpg',
          ''
        ))
    );
    return { props: { channels } };
  } catch (ex) {
    console.error(ex);
  }
  return { props: {} };
};

export default ChannelsListPage;
