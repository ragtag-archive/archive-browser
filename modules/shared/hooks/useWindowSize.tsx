import React from 'react';

export const useWindowSize = () => {
  const [innerWidth, setInnerWidth] = React.useState(null);
  const [innerHeight, setInnerHeight] = React.useState(null);

  const handleResize = () => {
    setInnerWidth(window.innerWidth);
    setInnerHeight(window.innerHeight);
  };

  React.useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { innerWidth, innerHeight };
};
