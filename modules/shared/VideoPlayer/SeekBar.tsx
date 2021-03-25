import React from "react";
import { formatSeconds } from "../format";

export type SeekBarProps = {
  value: number;
  max: number;
  buffer?: number;
  onChange: (value: number) => any;
};

const SeekBar = (props: SeekBarProps) => {
  const { value, max, onChange } = props;
  const buffer = props.buffer || 0;
  const [isScrubbing, setIsScrubbing] = React.useState(false);
  const [hoverPercentX, setHoverPercentX] = React.useState(0);
  const [isMouseOver, setIsMouseOver] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (e.clientX - rect.x) / rect.width));
    setHoverPercentX(percent);
    if (isScrubbing) onChange(percent * max);
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
        onMouseOver={() => setIsMouseOver(true)}
        onMouseOut={() => setIsMouseOver(false)}
        aria-label="Seekbar"
        aria-role="range"
        aria-valuenow={value}
      >
        <div className="absolute bottom-1 bg-white opacity-50 h-1 group-hover:h-2 w-full transition-all duration-200" />
        <div
          className="absolute bottom-1 bg-white opacity-50 h-1 group-hover:h-2"
          style={{
            transition: "height .2s",
            width: 100 * (buffer / max) + "%",
          }}
        />
        <div
          className="absolute bottom-1 bg-white opacity-50 h-1 group-hover:h-2"
          style={{
            transition: "height .2s",
            width: 100 * (isMouseOver ? hoverPercentX : 0) + "%",
          }}
        />
        <div
          className="absolute bottom-1 bg-blue-500 h-1 group-hover:h-2"
          style={{
            transition: "height .2s",
            width: (100 * value) / max + "%",
          }}
        />
        <div
          className="absolute -top-10 bg-black bg-opacity-75 px-2 py-1 rounded"
          style={{
            opacity: isMouseOver ? 1 : 0,
            left: hoverPercentX * 100 + "%",
          }}
        >
          {formatSeconds(hoverPercentX * max)}
        </div>
      </div>
    </>
  );
};

export default SeekBar;
