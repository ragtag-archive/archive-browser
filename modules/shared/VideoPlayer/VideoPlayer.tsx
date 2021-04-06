import React from "react";
import { formatSeconds } from "../format";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useThrottle } from "../hooks/useThrottle";
import {
  IconClosedCaptioningRegular,
  IconClosedCaptioningSolid,
  IconCompress,
  IconExpand,
  IconPause,
  IconPlay,
  IconVolume,
  IconVolumeMute,
} from "../icons";
import {
  K_AMPLITUDE_EVENT_VIDEO_CAPTIONS_CYCLE,
  K_AMPLITUDE_EVENT_VIDEO_MUTE_TOGGLE,
  K_AMPLITUDE_EVENT_VIDEO_PAUSE,
  K_AMPLITUDE_EVENT_VIDEO_PLAY,
  K_AMPLITUDE_EVENT_VIDEO_PLAYBACK_ERROR,
  K_AMPLITUDE_EVENT_VIDEO_READY_STATE,
  K_AMPLITUDE_EVENT_VIDEO_SEEK,
} from "../libs/amplitude/constants";
import { useAmplitude } from "../libs/amplitude/useAmplitude";
import { checkAutoplay } from "../util";
import LoaderRing from "./components/LoaderRing";
import SeekBar from "./SeekBar";
import { CaptionsRenderer } from "react-srv3";
import { useAnimationFrame } from "../hooks/useAnimationFrame";

type CaptionsTrack = {
  lang: string;
  src: string;
};

export type VideoPlayerProps = {
  srcVideo: string;
  srcAudio: string;
  srcPoster: string;
  captions?: CaptionsTrack[];
  onPlaybackProgress?: (progress: number) => any;
  autoplay?: boolean;
};

const VideoPlayer = (props: VideoPlayerProps) => {
  const { srcVideo, srcAudio, srcPoster } = props;
  const { logEvent } = useAmplitude();
  const captions = props.captions || [];
  const hasCaptions = captions.length > 0;
  const enCaptionIndex = captions.findIndex(
    (cap) => cap.lang === "en" || cap.lang.startsWith("en-")
  );

  const refSelf = React.useRef<HTMLDivElement>(null);
  const refVideo = React.useRef<HTMLVideoElement>(null);
  const refAudio = React.useRef<HTMLAudioElement>(null);

  const [now, setNow] = React.useState(Date.now());
  const [isDebugVisible, setIsDebugVisible] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(props.autoplay);
  const [videoReady, setVideoReady] = React.useState(false);
  const [audioReady, setAudioReady] = React.useState(true);
  const [playbackProgress, setPlaybackProgress] = React.useState(0);
  const [videoTime, setVideoTime] = React.useState(0);
  const [bufferProgress, setBufferProgress] = React.useState(0);
  const [audioVolume, setAudioVolume] = useLocalStorage("player:volume", 1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [lastActive, setLastActive] = React.useState(Date.now());
  const [activeCaption, setActiveCaption] = React.useState(enCaptionIndex);
  const [isVideoErrored, setIsVideoErrored] = React.useState(false);
  const [srv3CaptionXMLs, setSrv3CaptionXMLs] = React.useState([]);

  const [isContextVisible, setIsContextVisible] = React.useState(false);
  const [contextX, setContextX] = React.useState(0);
  const [contextY, setContextY] = React.useState(0);

  const avDuration = Math.min(
    refAudio.current?.duration || 0,
    refVideo.current?.duration || 0
  );

  const threshStartSync = React.useRef(0.25);
  const threshTimeReset = 2;
  const syncDebug = React.useRef("");

  useAnimationFrame(() => {
    if (!refVideo.current || !refAudio.current) return;
    const a = refAudio.current;
    const v = refVideo.current;

    // Update video time state
    setVideoTime(v.currentTime);

    // Check if ended
    const ended =
      refAudio.current.ended ||
      refVideo.current.ended ||
      refAudio.current.currentTime === refAudio.current.duration ||
      refVideo.current.currentTime === refVideo.current.duration;

    if (ended) {
      setIsPlaying(false);
      pingActivity();
      return;
    }

    setNow(Date.now());

    setIsPlaying((_isPlaying) => {
      // Check sync
      const timeDiff = Math.abs(a.currentTime - v.currentTime);
      syncDebug.current = "";
      if (_isPlaying) {
        if (timeDiff > threshStartSync.current) {
          if (timeDiff > threshTimeReset) {
            syncDebug.current = "reset";
            v.currentTime = a.currentTime;
            a.play();
            v.play();
          } else {
            if (a.currentTime > v.currentTime) {
              syncDebug.current = "a>v";
              a.pause();
              v.play();
            } else if (v.currentTime > a.currentTime) {
              syncDebug.current = "a<v";
              v.pause();
              a.play();
            }
          }
        } else {
          syncDebug.current = ">>";
          if (a.paused) a.play();
          if (v.paused) v.play();
        }
      } else {
        syncDebug.current = "||";
        console.log("e");
        if (!a.paused) a.pause();
        if (!v.paused) v.pause();
      }
      return _isPlaying;
    });
  });

  const handleCaptionsButton = () => {
    setActiveCaption((now) => ((now + 2) % (captions.length + 1)) - 1);
    logEvent(K_AMPLITUDE_EVENT_VIDEO_CAPTIONS_CYCLE, getPlayerState());
  };

  const handleMuteUnmute = () => {
    setAudioVolume((now) => (now === 0 ? 0.5 : 0));
    logEvent(K_AMPLITUDE_EVENT_VIDEO_MUTE_TOGGLE, getPlayerState());
  };

  const pingActivity = () => {
    setLastActive(new Date().getTime());
  };

  const getPlayerState = () => {
    return {
      srcVideo,
      srcAudio,
      isPlaying,
      videoReady,
      audioReady,
      playbackProgress,
      audioVolume,
      isFullscreen,
      hasCaptions,
      activeCaption: captions?.[activeCaption]?.lang || "",
    };
  };

  const updateBufferLength = () => {
    if (!refVideo.current || !refAudio.current) return;

    let maxVideo = 0;
    let maxAudio = 0;
    for (let i = 0; i < refVideo.current.buffered.length; i++)
      maxVideo =
        refVideo.current.buffered.start(i) <= playbackProgress
          ? Math.max(maxVideo, refVideo.current.buffered.end(i))
          : maxVideo;
    for (let i = 0; i < refAudio.current.buffered.length; i++)
      maxAudio =
        refAudio.current.buffered.start(i) <= playbackProgress
          ? Math.max(maxAudio, refAudio.current.buffered.end(i))
          : maxAudio;

    const maxBuffer = Math.min(maxVideo, maxAudio);
    setBufferProgress(maxBuffer);
  };

  const tryPlayVideo = async () =>
    refAudio.current
      .play()
      .then(() => refVideo.current.play())
      .catch((e) => {
        console.error(e);
        setIsPlaying(false);
      });

  const handlePlayPause = () => {
    if (isPlaying) {
      logEvent(K_AMPLITUDE_EVENT_VIDEO_PAUSE, getPlayerState());
    } else {
      logEvent(K_AMPLITUDE_EVENT_VIDEO_PLAY, getPlayerState());
    }

    if (!refVideo.current || !refAudio.current) return;
    pingActivity();

    if (isPlaying) {
      refAudio.current.pause();
      refVideo.current.pause();
    } else {
      tryPlayVideo();
    }
    setIsPlaying((now) => !now);
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
      new Error("Unknown error");

    setIsVideoErrored(true);
    console.error("Error playing video: ", error.message);
    console.error(e);
    logEvent(K_AMPLITUDE_EVENT_VIDEO_PLAYBACK_ERROR, {
      ...getPlayerState(),
      error: error.message,
    });
  };

  const nudgeTime = (delta: number) => {
    setPlaybackProgress((now) => {
      const newTime = Math.max(0, Math.min(now + delta, avDuration));
      refAudio.current.currentTime = newTime;
      refVideo.current.currentTime = newTime;
      return newTime;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let handled = true;

    if (e.key === " " || e.key === "k") {
      handlePlayPause();
    } else if (e.key === "ArrowRight") {
      nudgeTime(5);
    } else if (e.key === "ArrowLeft") {
      nudgeTime(-5);
    } else if (e.key === "l") {
      nudgeTime(10);
    } else if (e.key === "j") {
      nudgeTime(-10);
    } else if (e.key === "ArrowDown") {
      setAudioVolume((now) => Math.max(now - 0.1, 0));
    } else if (e.key === "ArrowUp") {
      setAudioVolume((now) => Math.min(now + 0.1, 1));
    } else if (e.key === "m") {
      handleMuteUnmute();
    } else if (e.key === "f") {
      handleFullscreen();
    } else if (e.key === "c") {
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
    logEvent(K_AMPLITUDE_EVENT_VIDEO_CAPTIONS_CYCLE, getPlayerState());
  };

  const handleSeek = (val: number) => {
    pingActivity();
    setPlaybackProgress(val);
    if (refVideo.current) {
      // refVideo.current.pause();
      refVideo.current.currentTime = val;
      setVideoReady(false);
    }
    if (refAudio.current) {
      // refAudio.current.pause();
      refAudio.current.currentTime = val;
      setAudioReady(false);
    }
    logEvent(K_AMPLITUDE_EVENT_VIDEO_SEEK, getPlayerState());
  };

  const syncDebounce = 1000;
  const dVideoReady = useThrottle(videoReady, syncDebounce);
  const dAudioReady = useThrottle(audioReady, syncDebounce);

  React.useEffect(() => {
    updateBufferLength();
  }, [playbackProgress]);

  React.useEffect(() => {
    logEvent(K_AMPLITUDE_EVENT_VIDEO_READY_STATE, getPlayerState());
  }, [videoReady, audioReady]);

  React.useEffect(() => {
    if (!refAudio.current) return;
    refAudio.current.volume = audioVolume;
  }, [audioVolume]);

  React.useEffect(() => {
    if (props.autoplay) {
      checkAutoplay().then((can) => {
        if (can) setIsPlaying(true);
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

  const isLoading =
    (!refVideo.current ||
      !refAudio.current ||
      !dVideoReady ||
      !dAudioReady ||
      !videoReady ||
      !audioReady) &&
    !(!refVideo.current?.paused && !refAudio.current?.paused);

  const controlsVisible = Date.now() - lastActive < 5000;

  return (
    <div
      className={[
        "video-player bg-black",
        "focus:outline-none",
        isFullscreen ? "absolute inset-0 flex flex-col justify-center" : "",
      ].join(" ")}
      style={{
        cursor: controlsVisible ? "auto" : "none",
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
          className="bg-black bg-opacity-50 text-white absolute left-2 top-2 z-40 p-4 whitespace-pre font-mono"
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
          {`Debug info
u: ${isPlaying ? "playing" : "paused"}
a: ${
            refAudio.current?.paused ? "paused" : "playing"
          } ${refAudio.current?.currentTime.toFixed(3)} 
v: ${
            refVideo.current?.paused ? "paused" : "playing"
          } ${refVideo.current?.currentTime.toFixed(3)} 
d: ${(refAudio.current?.currentTime - refVideo.current?.currentTime).toFixed(3)}
s: ${syncDebug.current}
`}
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
              left: contextX + "px",
              top: contextY + "px",
            }}
          >
            <div
              className="cursor-pointer px-6 py-4 hover:bg-black bg-opacity-25"
              onClick={() => setIsDebugVisible(true)}
            >
              Show debug info
            </div>
          </div>
        </>
      )}
      <div
        className="w-full h-0 relative overflow-hidden"
        style={{ paddingBottom: "56.25%" }}
      >
        <img
          className={
            "absolute inset-0 w-full h-full " +
            (bufferProgress > 0 ? "hidden" : "")
          }
          aria-hidden
          src={srcPoster}
        />
        <div
          className={[
            "absolute inset-0 pointer-events-none z-20 flex flex-col justify-center bg-black bg-opacity-25",
            "transition duration-200",
            isLoading || isVideoErrored ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          {isVideoErrored ? (
            <div className="text-center">
              <p>Error playing video</p>
            </div>
          ) : (
            <LoaderRing />
          )}
        </div>
        <div
          className="absolute inset-x-0 bottom-0 z-30 px-6 pt-2 transition duration-200"
          style={{
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
            opacity: controlsVisible ? 1 : 0,
          }}
        >
          <SeekBar
            value={playbackProgress}
            max={avDuration}
            buffer={bufferProgress}
            onChange={handleSeek}
            onMouseMove={pingActivity}
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
                {isPlaying ? (
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
                {formatSeconds(playbackProgress)} / {formatSeconds(avDuration)}
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
                  {captions?.[activeCaption]?.lang || "off"}
                </button>
              )}
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
              "w-full h-full absolute z-10 pointer-events-none " +
              (controlsVisible ? "controls-visible" : "")
            }
          >
            <CaptionsRenderer
              srv3={srv3CaptionXMLs[activeCaption]}
              currentTime={videoTime}
            />
          </div>
        )}
        <video
          ref={refVideo}
          src={srcVideo}
          className="w-full h-full absolute"
          preload="auto"
          crossOrigin="anonymous"
          onMouseUp={(e) => {
            e.preventDefault();
            handlePlayPause();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            if (controlsVisible) handlePlayPause();
            else pingActivity();
          }}
          onCanPlay={() => setVideoReady(true)}
          onPlaying={() => setVideoReady(true)}
          onSeeking={() => setVideoReady(false)}
          onSeeked={() => setVideoReady(true)}
          onWaiting={() => setVideoReady(false)}
          onStalled={() => setVideoReady(false)}
          onTimeUpdate={() => setVideoReady(true)}
          onError={handleMediaError}
          playsInline
          muted
        />
        <audio
          preload="auto"
          ref={refAudio}
          src={srcAudio}
          onCanPlay={() => setAudioReady(true)}
          onPlaying={() => setAudioReady(true)}
          onSeeking={() => setAudioReady(false)}
          onSeeked={() => setAudioReady(true)}
          onWaiting={() => setAudioReady(false)}
          onStalled={() => setAudioReady(false)}
          onLoad={() => setAudioReady(true)}
          onLoadedData={() => setAudioReady(true)}
          onError={handleMediaError}
          onTimeUpdate={() => {
            setAudioReady(true);
            setPlaybackProgress(refAudio.current.currentTime);
            props.onPlaybackProgress?.(refAudio.current.currentTime);
          }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
