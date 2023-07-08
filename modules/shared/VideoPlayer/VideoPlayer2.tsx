import React from 'react';
import { formatSeconds } from '../format';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  IconCamera,
  IconClosedCaptioningRegular,
  IconClosedCaptioningSolid,
  IconCompress,
  IconExpand,
  IconPause,
  IconPlay,
  IconVolume,
  IconVolumeMute,
} from '../icons';
import { checkAutoplay } from '../util';
import LoaderRing from './components/LoaderRing';
import SeekBar from './SeekBar';
import { CaptionsRenderer } from 'react-srv3';
import MediaSync, { MediaSyncRef, MediaSyncState } from './MediaSync';
import { NextImage } from '../NextImage';

type CaptionsTrack = {
  lang: string;
  src: string;
};

export type VideoPlayerProps = {
  srcVideo: string;
  srcAudio: string;
  srcPoster?: string;
  captions?: CaptionsTrack[];
  onPlaybackProgress?: (progress: number) => any;
  autoplay?: boolean;
  showWatermark?: boolean;
  videoId?: string;
};

const VideoPlayer2 = (props: VideoPlayerProps) => {
  const { srcVideo, srcAudio, srcPoster, videoId, showWatermark } = props;
  const captions = props.captions || [];
  const hasCaptions = captions.length > 0;
  const enCaptionIndex = captions.findIndex(
    (cap) => cap.lang === 'en' || cap.lang.startsWith('en-')
  );

  const refSelf = React.useRef<HTMLDivElement>(null);
  const refAudio = React.useRef<HTMLAudioElement>(null);
  const refVideo = React.useRef<HTMLVideoElement>(null);
  const refMedia = React.useRef<MediaSyncRef>(null);

  const lastMediaState = React.useRef<MediaSyncState>(null);

  const [bufferProgress, setBufferProgress] = React.useState(0);
  const [lastActive, setLastActive] = React.useState(Date.now());
  const [isVideoErrored, setIsVideoErrored] = React.useState(false);
  const [videoErrorMessage, setVideoErrorMessage] = React.useState('');
  const [srv3CaptionXMLs, setSrv3CaptionXMLs] = React.useState([]);

  const [audioVolume, setAudioVolume] = useLocalStorage('player:volume', 1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [activeCaption, setActiveCaption] = React.useState(enCaptionIndex);

  const [isDebugVisible, setIsDebugVisible] = React.useState(false);
  const [isContextVisible, setIsContextVisible] = React.useState(false);
  const [contextX, setContextX] = React.useState(0);
  const [contextY, setContextY] = React.useState(0);

  const handleCaptionsButton = () =>
    setActiveCaption((now) => ((now + 2) % (captions.length + 1)) - 1);

  const handleMuteUnmute = () => setAudioVolume((now) => (now === 0 ? 0.5 : 0));

  const pingActivity = () => {
    setLastActive(new Date().getTime());
  };

  const updateBufferLength = () => {
    if (!refVideo.current || !lastMediaState.current) return;

    let maxVideo = 0;
    for (let i = 0; i < refVideo.current.buffered.length; i++)
      maxVideo =
        refVideo.current.buffered.start(i) <= lastMediaState.current.timeSeconds
          ? Math.max(maxVideo, refVideo.current.buffered.end(i))
          : maxVideo;

    setBufferProgress(maxVideo);
  };

  const [_redraw, _setRedraw] = React.useState(0);
  const redraw = () => _setRedraw((x) => ++x);

  const handleVideoTimeUpdate = () => {
    updateBufferLength();
    props.onPlaybackProgress?.(lastMediaState.current.timeSeconds);
    redraw();
  };

  const handlePlayPause = () => {
    if (!refVideo.current) return;
    pingActivity();

    if (lastMediaState.current.isPlaying) refMedia.current.pause();
    else refMedia.current.play();
  };

  const handleMediaError = (
    e:
      | React.SyntheticEvent<HTMLVideoElement, Event>
      | React.SyntheticEvent<HTMLAudioElement, Event>
  ) => {
    const error =
      // @ts-ignore
      e.nativeEvent.path?.[0]?.error ||
      // @ts-ignore
      e.nativeEvent.originalTarget?.error ||
      new Error('Unknown error');

    refMedia.current.pause();
    setIsVideoErrored(true);
    console.error('Error playing video: ', error.message);
    console.error(e);

    // Try to find out the error
    fetch(srcVideo)
      .then((res) => res.text())
      .then((text) => {
        if (text.startsWith('{')) {
          const json = JSON.parse(text);
          setVideoErrorMessage(
            String(
              json.message || json.error.message || json.error.code || text
            )
          );
        } else setVideoErrorMessage(text);
      })
      .catch((e) => console.error(e));
  };

  const nudgeTime = (delta: number) => {
    const newTime = Math.max(
      0,
      Math.min(refVideo.current.currentTime + delta, refVideo.current.duration)
    );
    refVideo.current.currentTime = newTime;
    return newTime;
  };

  /**
   * Screenshot current video frame and download it
   */
  const captureFrame = () => {
    if (!refVideo.current) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = refVideo.current.videoWidth;
    canvas.height = refVideo.current.videoHeight;
    const ctx = canvas.getContext('2d');

    // Draw video frame to canvas
    ctx.drawImage(refVideo.current, 0, 0, canvas.width, canvas.height);

    // Generate URI and download
    const uri = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = uri;
    a.download =
      'Screenshot ' +
      videoId +
      ' ' +
      Math.floor(refVideo.current.currentTime * 1000) +
      'ms.png';
    a.click();

    // Clean up
    canvas.remove();
    a.remove();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let handled = true;

    if (e.ctrlKey || e.altKey || e.shiftKey) return false;

    if (e.key === ' ' || e.key === 'k') {
      handlePlayPause();
    } else if (e.key === 'ArrowRight') {
      nudgeTime(5);
    } else if (e.key === 'ArrowLeft') {
      nudgeTime(-5);
    } else if (e.key === 'l') {
      nudgeTime(10);
    } else if (e.key === 'j') {
      nudgeTime(-10);
    } else if (e.key === 'ArrowDown') {
      setAudioVolume((now) => Math.max(now - 0.1, 0));
    } else if (e.key === 'ArrowUp') {
      setAudioVolume((now) => Math.min(now + 0.1, 1));
    } else if (e.key === 'm') {
      handleMuteUnmute();
    } else if (e.key === 'f') {
      handleFullscreen();
    } else if (e.key === 'c') {
      handleCaptionsButton();
    } else handled = false;

    if (handled) {
      pingActivity();
      e.preventDefault();
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const playerRect = e.currentTarget.getBoundingClientRect();
    setContextX(e.clientX - playerRect.left);
    setContextY(e.clientY - playerRect.top);
    setIsContextVisible((now) => !now);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      refSelf.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSeek = (val: number) => {
    pingActivity();
    if (refMedia.current) refMedia.current.seek(val);
  };

  React.useEffect(() => {
    if (!refVideo.current) return;
    refAudio.current.volume = audioVolume;
  }, [audioVolume]);

  React.useEffect(() => {
    if (props.autoplay) {
      checkAutoplay().then((can) => {
        if (can) refMedia.current?.play?.();
      });
    }
  }, []);

  const loadCaptions = async (url: string) => {
    await fetch(url)
      .then((res) => res.text())
      .then((text) =>
        setSrv3CaptionXMLs((now) => ({ ...now, [activeCaption]: text }))
      );
  };

  React.useEffect(() => {
    if (activeCaption >= 0) loadCaptions(captions[activeCaption].src);
  }, [activeCaption]);

  const controlsVisible = Date.now() - lastActive < 5000;

  return (
    <div
      className={[
        'video-player bg-black',
        'focus:outline-none',
        'w-full h-full',
        isFullscreen ? 'absolute inset-0 flex flex-col justify-center' : '',
      ].join(' ')}
      style={{
        cursor: controlsVisible ? 'auto' : 'none',
      }}
      ref={refSelf}
      onMouseLeave={() => setLastActive(0)}
      onMouseMove={pingActivity}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      onBlur={() => setIsContextVisible(false)}
      tabIndex={0}
    >
      {isDebugVisible && (
        <div
          data-debug-window
          className="bg-black bg-opacity-50 text-white absolute left-2 top-2 z-40 p-4 whitespace-pre font-mono text-sm"
        >
          <div className="float-right">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsDebugVisible(false);
              }}
            >
              [x]
            </a>
          </div>
          {JSON.stringify(
            { ...(lastMediaState.current || {}), activeCaption },
            null,
            2
          )}
        </div>
      )}
      {isContextVisible && (
        <>
          <div
            className="fixed inset-0 w-full h-full z-40"
            onClick={() => setIsContextVisible(false)}
          />
          <div
            data-context-menu
            className="bg-black bg-opacity-50 rounded-lg absolute z-50 overflow-hidden"
            style={{
              left: contextX + 'px',
              top: contextY + 'px',
            }}
          >
            <div
              className="cursor-pointer px-6 py-4 hover:bg-black bg-opacity-25"
              onClick={() => {
                setIsDebugVisible(true);
                setIsContextVisible(false);
              }}
            >
              Show debug info
            </div>
          </div>
        </>
      )}
      <div className="w-full h-full relative overflow-hidden">
        {srcPoster && (
          <NextImage
            className={
              bufferProgress > 0 && lastMediaState.current?.timeSeconds > 0
                ? 'opacity-0'
                : 'z-10'
            }
            onClick={handlePlayPause}
            aria-hidden
            src={srcPoster}
            layout="fill"
            alt=""
          />
        )}
        <div
          className={[
            'absolute inset-0 pointer-events-none z-20 flex flex-col justify-center bg-black',
            'transition duration-200',
            isVideoErrored ? 'bg-opacity-75' : 'bg-opacity-25',
            lastMediaState.current?.isStalled || isVideoErrored
              ? 'opacity-100'
              : 'opacity-0',
          ].join(' ')}
        >
          {isVideoErrored ? (
            <div className="text-center">
              <p>Error playing video</p>
              <p>{videoErrorMessage}</p>
            </div>
          ) : (
            <LoaderRing />
          )}
        </div>
        <div
          className="absolute inset-x-0 bottom-0 z-30 px-6 pt-2 transition duration-200"
          style={{
            background:
              'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
            opacity: controlsVisible ? 1 : 0,
          }}
        >
          {showWatermark && (
            <div className="text-sm">
              <a
                target="_blank"
                href={'https://archive.ragtag.moe/watch?v=' + videoId}
              >
                Hosted on <span className="font-bold">Ragtag Archive</span>
              </a>
            </div>
          )}
          <SeekBar
            value={lastMediaState.current?.timeSeconds || 0}
            max={lastMediaState.current?.duration || 0}
            buffer={bufferProgress}
            onChange={handleSeek}
            onMouseMove={pingActivity}
            videoId={videoId}
          />
          <div className="flex justify-between">
            <div className="flex items-center">
              <button
                type="button"
                onMouseUp={(e) => {
                  e.preventDefault();
                  handlePlayPause();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handlePlayPause();
                }}
                className="py-3 px-4 focus:outline-none focus:bg-white focus:bg-opacity-25 rounded transition duration-200"
                aria-label="Play/Pause button"
              >
                {lastMediaState.current?.isPlaying ? (
                  <IconPlay width="1em" height="1em" />
                ) : (
                  <IconPause width="1em" height="1em" />
                )}
              </button>

              <div className="hidden md:flex group">
                <button
                  type="button"
                  onClick={handleMuteUnmute}
                  className="py-3 px-4 focus:outline-none focus:bg-white focus:bg-opacity-25 rounded transition duration-200"
                  aria-label="Mute/Unmute button"
                >
                  {audioVolume === 0 ? (
                    <IconVolumeMute width="1em" height="1em" />
                  ) : (
                    <IconVolume width="1em" height="1em" />
                  )}
                </button>

                <div
                  className="
                    flex
                    h-12 w-0 group-hover:w-16
                    overflow-hidden
                    transition-all duration-200
                  "
                >
                  <input
                    type="range"
                    className="slider w-16"
                    aria-label="Volume slider"
                    value={audioVolume}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(e) => {
                      setAudioVolume(Number(e.target.value));
                      pingActivity();
                    }}
                  />
                </div>
              </div>

              <p className="ml-4">
                {formatSeconds(lastMediaState.current?.timeSeconds || 0)} /{' '}
                {formatSeconds(lastMediaState.current?.duration || 0)}
              </p>
            </div>
            <div>
              {hasCaptions && (
                <button
                  type="button"
                  aria-label="Toggle captions button"
                  onClick={handleCaptionsButton}
                  className="py-3 px-4 focus:outline-none focus:bg-white focus:bg-opacity-25 rounded transition duration-200"
                >
                  {activeCaption === -1 ? (
                    <IconClosedCaptioningRegular
                      width="1em"
                      height="1em"
                      className="inline-block mr-2"
                    />
                  ) : (
                    <IconClosedCaptioningSolid
                      width="1em"
                      height="1em"
                      className="inline-block mr-2"
                    />
                  )}
                  <span className="leading-none">
                    {captions?.[activeCaption]?.lang || 'off'}
                  </span>
                </button>
              )}
              <button
                type="button"
                aria-label="Screenshot current video frame"
                onClick={captureFrame}
                className="hidden md:inline-block py-3 px-4 focus:outline-none focus:bg-white focus:bg-opacity-25 rounded transition duration-200"
              >
                <IconCamera width="1em" height="1em" />
              </button>
              <button
                type="button"
                aria-label="Toggle fullscreen button"
                onClick={handleFullscreen}
                className="py-3 px-4 focus:outline-none focus:bg-white focus:bg-opacity-25 rounded transition duration-200"
              >
                {isFullscreen ? (
                  <IconCompress width="1em" height="1em" />
                ) : (
                  <IconExpand width="1em" height="1em" />
                )}
              </button>
            </div>
          </div>
        </div>
        {activeCaption > -1 && srv3CaptionXMLs[activeCaption] && (
          <div
            className={
              'w-full h-full absolute z-10 pointer-events-none ' +
              (controlsVisible ? 'controls-visible' : '')
            }
          >
            <CaptionsRenderer
              srv3={srv3CaptionXMLs[activeCaption]}
              currentTime={lastMediaState.current?.timeSeconds || 0}
            />
          </div>
        )}
        <MediaSync
          ref={refMedia}
          onStateUpdate={(newState) => {
            lastMediaState.current = newState;
            if (activeCaption > -1) redraw();
          }}
        >
          <video
            ref={refVideo}
            src={srcVideo}
            className="w-full h-full absolute"
            preload="auto"
            crossOrigin="anonymous"
            onMouseUp={(e) => {
              e.preventDefault();
              if (e.button === 0) handlePlayPause();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              if (controlsVisible) handlePlayPause();
              else pingActivity();
            }}
            onError={handleMediaError}
            onTimeUpdate={handleVideoTimeUpdate}
            playsInline
            muted
          />
          <audio
            preload="auto"
            crossOrigin="anonymous"
            ref={refAudio}
            src={srcAudio}
            onError={handleMediaError}
          />
        </MediaSync>
      </div>
    </div>
  );
};

export default VideoPlayer2;
