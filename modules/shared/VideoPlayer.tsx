import React from "react";
import { formatSeconds } from "./format";

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  width="1em"
                  height="1em"
                >
                  {isPlaying ? (
                    <path
                      fill="currentColor"
                      d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"
                    />
                  ) : (
                    <path
                      fill="currentColor"
                      d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
                    />
                  )}
                </svg>
              </button>

              <button
                type="button"
                onClick={handleMuteUnmute}
                className="py-3 px-4 focus:outline-none focus:bg-white focus:bg-opacity-25 rounded transition duration-200"
              >
                {audioVolume === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="1em"
                    height="1em"
                  >
                    <path
                      fill="currentColor"
                      d="M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zM461.64 256l45.64-45.64c6.3-6.3 6.3-16.52 0-22.82l-22.82-22.82c-6.3-6.3-16.52-6.3-22.82 0L416 210.36l-45.64-45.64c-6.3-6.3-16.52-6.3-22.82 0l-22.82 22.82c-6.3 6.3-6.3 16.52 0 22.82L370.36 256l-45.63 45.63c-6.3 6.3-6.3 16.52 0 22.82l22.82 22.82c6.3 6.3 16.52 6.3 22.82 0L416 301.64l45.64 45.64c6.3 6.3 16.52 6.3 22.82 0l22.82-22.82c6.3-6.3 6.3-16.52 0-22.82L461.64 256z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 480 512"
                    width="1em"
                    height="1em"
                  >
                    <path
                      fill="currentColor"
                      d="M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.53 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z"
                    ></path>
                  </svg>
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
              <button
                type="button"
                onClick={handleFullscreen}
                className="py-3 px-4 focus:outline-none focus:bg-white focus:bg-opacity-25 rounded transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  width="1em"
                  height="1em"
                >
                  <path
                    fill="currentColor"
                    d="M0 180V56c0-13.3 10.7-24 24-24h124c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H64v84c0 6.6-5.4 12-12 12H12c-6.6 0-12-5.4-12-12zM288 44v40c0 6.6 5.4 12 12 12h84v84c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12V56c0-13.3-10.7-24-24-24H300c-6.6 0-12 5.4-12 12zm148 276h-40c-6.6 0-12 5.4-12 12v84h-84c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h124c13.3 0 24-10.7 24-24V332c0-6.6-5.4-12-12-12zM160 468v-40c0-6.6-5.4-12-12-12H64v-84c0-6.6-5.4-12-12-12H12c-6.6 0-12 5.4-12 12v124c0 13.3 10.7 24 24 24h124c6.6 0 12-5.4 12-12z"
                  />
                </svg>
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
                default={lang === "en" || lang === "en-US"}
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
