import { GetServerSideProps } from 'next';
import {
  ES_INDEX,
  DRIVE_BASE_URL,
  ENABLE_RAID_MODE,
  RAID_MODE_ALLOW_VIDEO_PLAYBACK,
} from '../modules/shared/config';
import {
  ElasticSearchResult,
  VideoFile,
  VideoMetadata,
} from '../modules/shared/database.d';
import { Elastic } from '../modules/shared/database';
import { signFileURLs, signURL } from '../modules/shared/fileAuth';
import { getRemoteAddress } from '../modules/shared/util';
import WatchPage, { WatchPageProps } from '../modules/WatchPage';
import { apiRelatedVideos, apiSearch } from './api/v1/search';
import { apiVideo } from './api/video';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  for (let tries = 0; tries < 5; tries++) {
    try {
      const v = (ctx.query.v as string).trim();

      if (!v) return { notFound: true };

      const [searchResult, related] = await Promise.all([
        apiSearch({ v }),
        apiRelatedVideos(v),
      ]);
      const _searchResult =
        searchResult.data as ElasticSearchResult<VideoMetadata>;
      if (_searchResult.hits.total.value === 0) return { notFound: true };
      const videoInfo = _searchResult.hits.hits[0]._source;

      // Grab number of videos by channel
      const _channelSearch = await apiSearch({
        channel_id: videoInfo.channel_id,
        size: 0,
      });
      const channelVideoCount = (
        _channelSearch.data as ElasticSearchResult<VideoMetadata>
      ).hits.total.value;

      // Fetch file list from GDrive if not available in database
      const files: VideoFile[] = Array.isArray(videoInfo.files)
        ? videoInfo.files
        : await apiVideo({ v }).then(({ files }) => files);

      // Update database if file list not available
      if (!Array.isArray(videoInfo.files)) {
        console.log('Updating DB with files', files);
        const updateres = await Elastic.request({
          method: 'post',
          url: '/' + ES_INDEX + '/_update/' + v,
          data: { doc: { files } },
        }).catch(({ response }) => response);
        console.log(updateres.data);
      }

      // Sign URLs
      const ip = getRemoteAddress(ctx.req);
      signFileURLs(videoInfo.drive_base, videoInfo.files, ip);
      const channelProfileURL = signURL(
        DRIVE_BASE_URL + '/' + videoInfo.channel_id + '/profile.jpg',
        ip
      );
      related.hits.hits.forEach((hit) =>
        signFileURLs(hit._source.drive_base, hit._source.files, ip)
      );

      const disablePlayback =
        ENABLE_RAID_MODE && !RAID_MODE_ALLOW_VIDEO_PLAYBACK;

      const props: WatchPageProps = {
        videoInfo: {
          ...videoInfo,
          files,
        },
        hasChat: !!files.find(
          (file) =>
            file.name === v + '.chat.json' ||
            file.name === v + '.live_chat.json'
        ),
        relatedVideos: related.hits.hits
          .map((hit) => hit._source)
          .filter((video) => video.video_id !== v),
        channelVideoCount,
        channelProfileURL,
        disablePlayback,
      };

      return { props };
    } catch (ex) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return { props: {} };
};

export default WatchPage;
