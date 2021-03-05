import React from "react";
import { formatSeconds } from "../format";
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
  K_AMPLITUDE_EVENT_VIDEO_VOLUME_ADJUST,
} from "../libs/amplitude/constants";
import { useAmplitude } from "../libs/amplitude/useAmplitude";
import LoaderRing from "./components/LoaderRing";

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
};

const VideoPlayer = (props: VideoPlayerProps) => {
  const { srcVideo, srcAudio, srcPoster } = props;
  const captions = props.captions || [];

  const refSelf = React.useRef<HTMLDivElement>(null);
  const refVideo = React.useRef<HTMLVideoElement>(null);
  const refAudio = React.useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [videoReady, setVideoReady] = React.useState(false);
  const [audioReady, setAudioReady] = React.useState(false);
  const [playbackProgress, setPlaybackProgress] = React.useState(0);
  const [audioVolume, setAudioVolume] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [lastActive, setLastActive] = React.useState(0);
  const [activeCaption, setActiveCaption] = React.useState(-1);
  const [isVideoErrored, setIsVideoErrored] = React.useState(false);

  const { logEvent } = useAmplitude();

  const hasCaptions = captions.length > 0;

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
      if (!videoReady || !audioReady) return;

      refAudio.current.play();
      refVideo.current.play();
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
      const newTime = Math.max(
        0,
        Math.min(
          now + delta,
          refAudio.current.duration,
          refVideo.current.duration
        )
      );
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
      refVideo.current.pause();
      refVideo.current.currentTime = val;
      setVideoReady(false);
    }
    if (refAudio.current) {
      refAudio.current.pause();
      refAudio.current.currentTime = val;
      setAudioReady(false);
    }
    logEvent(K_AMPLITUDE_EVENT_VIDEO_SEEK, getPlayerState());
  };

  const syncDebounce = 1000;
  const dVideoReady = useThrottle(videoReady, syncDebounce);
  const dAudioReady = useThrottle(audioReady, syncDebounce);

  const avSync = () => {
    if (!refAudio.current || !refVideo.current) return;

    // Sync time
    if (
      Math.abs(refAudio.current.currentTime - refVideo.current.currentTime) >
      0.5
    )
      refVideo.current.currentTime = refAudio.current.currentTime;

    // Sync playback state
    const ended = refAudio.current.ended || refVideo.current.ended;
    if (isPlaying && dVideoReady && dAudioReady && !ended) {
      refVideo.current.play();
      refAudio.current.play();
    } else {
      refVideo.current.pause();
      refAudio.current.pause();
    }
  };

  React.useEffect(() => {
    avSync();
  }, [dVideoReady, dAudioReady, isPlaying, playbackProgress]);

  React.useEffect(() => {
    logEvent(K_AMPLITUDE_EVENT_VIDEO_READY_STATE, getPlayerState());
  }, [videoReady, audioReady]);

  React.useEffect(() => {
    document.addEventListener("visibilitychange", avSync);
    return () => document.removeEventListener("visibilitychange", avSync);
  }, [isPlaying]);

  React.useEffect(() => {
    if (!refVideo.current) return;
    refAudio.current.volume = audioVolume;
  }, [audioVolume]);

  React.useEffect(() => {
    if (!refSelf.current) return;
    refSelf.current.addEventListener("mousemove", pingActivity);
    return () =>
      refSelf.current?.removeEventListener?.("mousemove", pingActivity);
  }, [refSelf]);

  React.useEffect(() => {
    for (let i = 0; i < refVideo.current.textTracks.length; i++) {
      refVideo.current.textTracks[i].mode = "hidden";
    }
    if (activeCaption >= 0)
      refVideo.current.textTracks[activeCaption].mode = "showing";
  }, [activeCaption]);

  const isLoading =
    !refVideo.current ||
    !refAudio.current ||
    !dVideoReady ||
    !dAudioReady ||
    !videoReady ||
    !audioReady;

  const controlsVisible = new Date().getTime() - lastActive < 5000;

  return (
    <div
      className={[
        "video-player bg-gray-900",
        "focus:outline-none",
        isFullscreen ? "absolute inset-0 flex flex-col justify-center" : "",
      ].join(" ")}
      ref={refSelf}
      onMouseOut={() => setLastActive(0)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="w-full h-0 relative overflow-hidden"
        style={{ paddingBottom: "56.25%" }}
      >
        <img className="absolute inset-0" aria-hidden src={srcPoster} />
        <div
          className={[
            "absolute inset-0 pointer-events-none z-10 flex flex-col justify-center bg-black bg-opacity-25",
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
          className="absolute inset-x-0 bottom-0 z-20 px-6 transition duration-200"
          style={{
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
            opacity: controlsVisible ? 1 : 0,
          }}
        >
          <div className="w-full h-4 relative group">
            <div className="absolute bottom-0 bg-white opacity-50 h-1 group-hover:h-2 rounded-full w-full transition-all duration-200" />
            <div
              className="absolute bottom-0 bg-blue-500 h-1 group-hover:h-2 rounded-full"
              style={{
                transition: "height .2s",
                width:
                  (100 * playbackProgress) / (refVideo.current?.duration || 1) +
                  "%",
              }}
            />
            <input
              type="range"
              className="absolute bottom-0 w-full seekbar"
              aria-label="Seekbar"
              value={playbackProgress}
              min={0}
              max={refVideo.current?.duration}
              onChange={(e) => handleSeek(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-row justify-between">
            <div>
              <button
                type="button"
                onClick={handlePlayPause}
                className="py-3 px-4 focus:outline-none focus:bg-white focus:bg-opacity-25 rounded transition duration-200"
                aria-label="Play/Pause button"
              >
                {isPlaying ? (
                  <IconPlay width="1em" height="1em" />
                ) : (
                  <IconPause width="1em" height="1em" />
                )}
              </button>

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

              <input
                type="range"
                className="slider"
                aria-label="Volume slider"
                value={audioVolume}
                min={0}
                max={1}
                step={0.1}
                onChange={(e) => {
                  setAudioVolume(Number(e.target.value));
                  pingActivity();
                  logEvent(
                    K_AMPLITUDE_EVENT_VIDEO_VOLUME_ADJUST,
                    getPlayerState()
                  );
                }}
              />

              <p className="inline-block ml-4 py-2">
                {formatSeconds(playbackProgress)} /{" "}
                {formatSeconds(refVideo.current?.duration || 0)}
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
        <video
          ref={refVideo}
          src={srcVideo}
          className="w-full h-full absolute"
          preload="auto"
          crossOrigin="anonymous"
          onClick={handlePlayPause}
          onCanPlay={() => setVideoReady(true)}
          onPlaying={() => setVideoReady(true)}
          onSeeking={() => setVideoReady(false)}
          onSeeked={() => setVideoReady(true)}
          onWaiting={() => setVideoReady(false)}
          onStalled={() => setVideoReady(false)}
          onTimeUpdate={() => setVideoReady(true)}
          onError={handleMediaError}
        >
          {captions.map(({ lang, src }) => {
            return (
              <track
                key={lang}
                kind="subtitles"
                label={lang}
                srcLang={lang}
                src={src}
              />
            );
          })}
        </video>
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
