export const formatSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor((seconds % 3600) % 60);

  const mmss =
    m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
  if (h > 0) return h + ":" + mmss;
  return mmss;
};
