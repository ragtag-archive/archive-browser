import React from 'react';

/**
 * React hook to request animation frame
 *
 * Taken from https://css-tricks.com/using-requestanimationframe-with-react-hooks/
 */
export const useAnimationFrame = (
  callback: (deltaTime: number) => void,
  dependencies: any[] = []
) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef(0);
  const previousTimeRef = React.useRef(0);

  const animate = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, dependencies);
};
