import React from "react";
import { VIDEO_STORYBOARD_URL } from "../config";
import { formatSeconds } from "../format";

export type SeekBarProps = {
  value: number;
  max: number;
  buffer?: number;
  onChange: (value: number) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

  videoId?: string;
};

const SeekBar = (props: SeekBarProps) => {
  const { value, max, onChange, videoId } = props;
  const buffer = props.buffer || 0;
  const [isScrubbing, setIsScrubbing] = React.useState(false);
  const [hoverPercentX, setHoverPercentX] = React.useState(0);
  const [isMouseOver, setIsMouseOver] = React.useState(false);

  // Storyboard positioning
  const storyboardURL = videoId ? VIDEO_STORYBOARD_URL + "?v=" + videoId : "";
  const tileX = Math.floor(100 * hoverPercentX) % 10;
  const tileY = Math.floor((100 * hoverPercentX) / 10);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (e.clientX - rect.x) / rect.width));
    setHoverPercentX(percent);
    if (isScrubbing) onChange(percent * max);

    props.onMouseMove?.(e);
  };

  return (
    <>
      <div
        className="w-full h-4 relative group cursor-pointer"
        onMouseDown={() => {
          setIsScrubbing(true);
          onChange(hoverPercentX * max);
        }}
        onMouseUp={() => setIsScrubbing(false)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsMouseOver(true)}
        onMouseLeave={() => setIsMouseOver(false)}
        aria-label="Seekbar"
        aria-valuenow={value}
      >
        <div className="absolute bottom-1 w-full pt-4 pb-2 -mb-2">
          <div className="relative w-full h-0.5 group-hover:h-1 transition-all duration-200">
            <div className="absolute bg-white opacity-50 h-full w-full" />
            <div
              className="absolute bg-white opacity-50 h-full"
              style={{
                width: 100 * (buffer / max) + "%",
              }}
            />
            <div
              className="absolute bg-white opacity-50 h-full"
              style={{
                width: 100 * (isMouseOver ? hoverPercentX : 0) + "%",
              }}
            />
            <div
              className="absolute bg-blue-500 h-full"
              style={{
                width: (100 * value) / max + "%",
              }}
            />
          </div>
        </div>
        <div
          className="absolute bottom-4 pointer-events-none w-1/4 text-center rounded overflow-hidden"
          style={{
            opacity: isMouseOver ? 1 : 0,
            left: Math.min(90, Math.max(10, hoverPercentX * 100)) + "%",
            transform: "translateX(-50%)",
          }}
        >
          {storyboardURL && (
            <div
              className="w-full relative overflow-hidden"
              style={{
                paddingBottom: "56.25%",
              }}
            >
              <img
                src={storyboardURL}
                style={{
                  position: "absolute",
                  minWidth: "1000%",
                  width: "1000%",
                  height: "1000%",
                  left: "-" + tileX * 100 + "%",
                  top: "-" + tileY * 100 + "%",
                }}
              />
            </div>
          )}
          <div className="bg-black bg-opacity-75 px-2 py-1 text-center">
            {formatSeconds(hoverPercentX * max)}
          </div>
        </div>
      </div>
    </>
  );
};

export default SeekBar;
