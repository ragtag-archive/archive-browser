import React from "react";
import { formatSeconds } from "./format";
import {
  IconClosedCaptioningRegular,
  IconClosedCaptioningSolid,
  IconCompress,
  IconExpand,
  IconPause,
  IconPlay,
  IconVolume,
  IconVolumeMute,
} from "./icons";

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

  const hasCaptions = captions.length > 0;

  const handleCaptionsButton = () =>
    setActiveCaption((now) => ((now + 2) % (captions.length + 1)) - 1);

  const handleMuteUnmute = () => {
    setAudioVolume((now) => (now === 0 ? 0.5 : 0));
  };

  const pingActivity = () => {
    setLastActive(new Date().getTime());
  };

  const handlePlayPause = () => {
    if (!refVideo.current || !refAudio.current) return;
    if (!videoReady || !audioReady) return;

    if (isPlaying) {
      refAudio.current.pause();
      refVideo.current.pause();
    } else {
      refAudio.current.play();
      refVideo.current.play();
    }
    setIsPlaying((now) => !now);
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

  const handleVisibilityChange = () => {
    if (isPlaying) {
      refAudio.current?.play?.();
      refVideo.current?.play?.();
    } else {
      refAudio.current?.pause?.();
      refVideo.current?.pause?.();
    }
  };

  React.useEffect(() => {
    refVideo.current?.pause?.();
    refAudio.current?.pause?.();
    setIsPlaying(false);
    setVideoReady(false);
    setAudioReady(false);
    setPlaybackProgress(0);

    refVideo.current?.load?.();
    refAudio.current?.load?.();
    props.onPlaybackProgress?.(0);

    if (refVideo.current) refVideo.current.currentTime = 0;
    if (refAudio.current) refAudio.current.currentTime = 0;
  }, [srcVideo, srcAudio]);

  React.useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    if (videoReady && audioReady && isPlaying) {
      refVideo.current.play();
      refAudio.current.play();
    }
  }, [videoReady, audioReady]);

  React.useEffect(() => {
    for (let i = 0; i < refVideo.current.textTracks.length; i++) {
      refVideo.current.textTracks[i].mode = "hidden";
    }
    if (activeCaption >= 0)
      refVideo.current.textTracks[activeCaption].mode = "showing";
  }, [activeCaption]);

  const isLoading =
    !refVideo.current || !refAudio.current || !videoReady || !audioReady;

  const controlsVisible = new Date().getTime() - lastActive < 5000;

  return (
    <div
      className={
        "video-player bg-gray-900 " +
        (isFullscreen ? "absolute inset-0 flex flex-col justify-center" : "")
      }
      ref={refSelf}
      onMouseOut={() => setLastActive(0)}
    >
      <div
        className="w-full h-0 relative overflow-hidden"
        style={{ paddingBottom: "56.25%" }}
      >
        <div
          className={[
            "absolute inset-0 pointer-events-none z-10 flex flex-col justify-center bg-black bg-opacity-25",
            "transition duration-200",
            isLoading ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          <div className="lds-ring mx-auto">
            <div />
            <div />
            <div />
            <div />
          </div>
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
            <div className="absolute bottom-0 bg-white opacity-50 h-1 group-hover:h-2 w-full transition-all duration-200" />
            <div
              className="absolute bottom-0 bg-blue-500 h-1 group-hover:h-2"
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
              value={playbackProgress}
              min={0}
              max={refVideo.current?.duration}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLastActive(new Date().getTime());
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
              }}
            />
          </div>
          <div className="flex flex-row justify-between">
            <div>
              <button
                type="button"
                onClick={handlePlayPause}
                className="py-3 px-4 focus:outline-none focus:bg-white focus:bg-opacity-25 rounded transition duration-200"
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
                value={audioVolume}
                min={0}
                max={1}
                step={0.01}
                onChange={(e) => setAudioVolume(Number(e.target.value))}
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
          poster={srcPoster}
          onCanPlay={() => {
            console.log("[video] onCanPlay()");
            setVideoReady(true);
          }}
          onPlaying={() => {
            console.log("[video] onPlaying()");
            setVideoReady(true);
          }}
          onPlay={() => {
            console.log("[video] onPlay()");
            if (!refAudio.current) return;
            refAudio.current.currentTime = refVideo.current.currentTime;
            refAudio.current.play();
          }}
          onPause={() => {
            console.log("[video] onPause()");
            if (!refAudio.current) return;
            refAudio.current.currentTime = refVideo.current.currentTime;
            refAudio.current.pause();
          }}
          onWaiting={() => {
            console.log("[video] onWaiting()");
            setVideoReady(false);
            refAudio.current?.pause();
          }}
          onStalled={() => {
            console.log("[video] onStalled()");
            setVideoReady(false);
            refAudio.current?.pause();
          }}
          onClick={handlePlayPause}
          onTimeUpdate={() => {
            if (!refAudio.current || !refVideo.current) return;
            if (!isPlaying) refVideo.current.pause();

            setPlaybackProgress(refVideo.current.currentTime);
            setVideoReady(true);

            if (refVideo.current.ended) setIsPlaying(false);

            // Resync if more than 500ms off
            if (
              Math.abs(
                refAudio.current.currentTime - refVideo.current.currentTime
              ) > 0.5
            )
              refAudio.current.currentTime = refVideo.current.currentTime;

            try {
              if (refVideo.current.paused) refAudio.current.pause();
              else refAudio.current.play();
            } catch (ex) {}

            // Update parent
            props.onPlaybackProgress?.(refVideo.current.currentTime);
          }}
          onEnded={() => {
            console.log("[video] onEnded()");
            setIsPlaying(false);
          }}
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
          onLoadedData={() => setAudioReady(true)}
          onTimeUpdate={() => {
            setAudioReady(true);
            if (!isPlaying) refAudio.current.pause();
          }}
        ></audio>
      </div>
    </div>
  );
};

export default VideoPlayer;
