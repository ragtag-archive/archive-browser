import React from 'react';
import Head from 'next/head';
import ChatReplayPanel from './shared/ChatReplay/ChatReplayPanel';
import { useWindowSize } from './shared/hooks/useWindowSize';
import PageBase from './shared/PageBase';
import VideoPlayer2 from './shared/VideoPlayer/VideoPlayer2';
import { buttonStyle } from './shared/VideoActionButtons';
import { IconCheck } from './shared/icons';
import { SITE_NAME } from './shared/config';
import useLocalStorageState from 'use-local-storage-state';

const CustomPlayerPage = () => {
  const [isChatVisible, setIsChatVisible] = useLocalStorageState('chat:visible', { defaultValue: true });
  const { innerWidth, innerHeight } = useWindowSize();
  const [playbackProgress, setPlaybackProgress] = React.useState(0);
  const [urlVideo, setUrlVideo] = React.useState('');
  const [urlChat, setUrlChat] = React.useState('');
  const [urlYtt, setUrlYtt] = React.useState('');
  const [urlInfo, setUrlInfo] = React.useState('');
  const [showPlayer, setShowPlayer] = React.useState(false);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (newValue: string) => any
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.error('No file selected');
      return false;
    }
    const url = URL.createObjectURL(file).toString();
    console.log(url);
    setter(url);
  };

  return (
    <PageBase>
      <Head>
        <title>Custom Player - {SITE_NAME}</title>
      </Head>
      {showPlayer ? (
        <div>
          <div
            className="flex lg:flex-row flex-col lg:h-auto"
            style={{
              height: isChatVisible && innerWidth < 1024 ? innerHeight : 'auto',
            }}
          >
            <div className="w-full lg:w-3/4">
              <div
                className="relative bg-gray-400 w-full h-0"
                style={{ paddingBottom: '56.25%' }}
              >
                <div className="absolute inset-0 w-full h-full">
                  <VideoPlayer2
                    key={urlVideo}
                    videoId="custom"
                    srcVideo={urlVideo}
                    srcAudio={urlVideo}
                    captions={
                      urlYtt
                        ? [
                            {
                              lang: 'en',
                              src: urlYtt,
                            },
                          ]
                        : undefined
                    }
                    onPlaybackProgress={setPlaybackProgress}
                  />
                </div>
              </div>
            </div>
            <div
              className={[
                'w-full lg:w-1/4 lg:pl-4',
                isChatVisible ? 'flex-1' : '',
              ].join(' ')}
            >
              {!urlChat ? (
                <div className="border border-gray-800 rounded p-4 text-center">
                  <p>Chat replay unavailable</p>
                </div>
              ) : (
                <ChatReplayPanel
                  src={urlChat}
                  info={urlInfo}
                  currentTimeSeconds={playbackProgress}
                />
              )}
            </div>
          </div>
          <button
            type="button"
            className={[buttonStyle, 'mt-4'].join(' ')}
            onClick={() => setShowPlayer(false)}
          >
            Go back
          </button>
        </div>
      ) : (
        <div>
          <div className="px-4 pb-8">
            <h1 className="text-3xl mt-16 text-center">Custom Video Player</h1>
            <p className="text-lg text-center">
              You can play locally-saved video files and chat replay JSON
            </p>
            <p className="text-center">
              Chat replay compatible with output from{' '}
              <a
                className="underline"
                href="https://github.com/yt-dlp/yt-dlp"
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                yt-dlp
              </a>
              {' and '}
              <a
                className="underline"
                href="https://pypi.org/project/chat-downloader/"
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                chat-downloader
              </a>
              .
            </p>
          </div>
          <div className="mx-auto max-w-md">
            <form>
              <label
                className={[buttonStyle, 'relative cursor-pointer'].join(' ')}
              >
                <span>Select video</span>
                <span className="ml-auto">
                  {urlVideo ? <IconCheck width="1em" height="1em" /> : null}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFile(e, setUrlVideo)}
                />
              </label>
              <label
                className={[buttonStyle, 'relative cursor-pointer'].join(' ')}
              >
                <span>Select chat json</span>
                <span className="ml-auto">
                  {urlChat ? <IconCheck width="1em" height="1em" /> : null}
                </span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => handleFile(e, setUrlChat)}
                />
              </label>
              <label
                className={[buttonStyle, 'relative cursor-pointer'].join(' ')}
              >
                <span>Select captions (srv3)</span>
                <span className="ml-auto">
                  {urlYtt ? <IconCheck width="1em" height="1em" /> : null}
                </span>
                <input
                  type="file"
                  accept=".srv3"
                  className="hidden"
                  onChange={(e) => handleFile(e, setUrlYtt)}
                />
              </label>
              <label
                className={[buttonStyle, 'relative cursor-pointer'].join(' ')}
              >
                <span>Select info json</span>
                <span className="ml-auto">
                  {urlInfo ? <IconCheck width="1em" height="1em" /> : null}
                </span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => handleFile(e, setUrlInfo)}
                />
              </label>

              <button
                type="button"
                className={[buttonStyle, 'mt-8 ml-auto'].join(' ')}
                onClick={() => setShowPlayer(true)}
              >
                Launch player
              </button>
            </form>
          </div>
        </div>
      )}
    </PageBase>
  );
};

export default CustomPlayerPage;
