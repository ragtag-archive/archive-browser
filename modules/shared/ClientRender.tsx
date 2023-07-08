import React from 'react';

export type ClientRenderProps = {
  children: React.ReactNode;
  enableSSR?: boolean;
};

/**
 * Force component to re-render client-side
 */
const ClientRender = (props: ClientRenderProps) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted || props.enableSSR ? (
    <React.Fragment key={String(isMounted)}>{props.children}</React.Fragment>
  ) : null;
};

export default ClientRender;
