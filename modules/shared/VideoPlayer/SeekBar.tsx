import React from "react";

export type SeekBarProps = {
  value: number;
  max: number;
  onChange: (value: number) => any;
};

const SeekBar = (props: SeekBarProps) => {
  const { value, max, onChange } = props;
  const [isScrubbing, setIsScrubbing] = React.useState(false);
  const [hoverPercentX, setHoverPercentX] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (e.clientX - rect.x) / rect.width));
    setHoverPercentX(percent);
    if (isScrubbing) onChange(percent * max);
  };

  return (
    <div
      className="w-full h-4 relative group cursor-pointer"
      onMouseDown={() => {
        setIsScrubbing(true);
        onChange(hoverPercentX * max);
      }}
      onMouseUp={() => setIsScrubbing(false)}
      onMouseMove={handleMouseMove}
      aria-label="Seekbar"
      aria-role="slider"
      aria-valuenow={value}
    >
      <div className="absolute bottom-1 bg-white opacity-50 h-1 group-hover:h-2 w-full transition-all duration-200" />
      <div
        className="absolute bottom-1 bg-blue-500 h-1 group-hover:h-2"
        style={{
          transition: "height .2s",
          width: (100 * value) / max + "%",
        }}
      />
    </div>
  );
};

export default SeekBar;
