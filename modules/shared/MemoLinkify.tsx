import React from 'react';
import Linkify from 'react-linkify';

export type MemoLinkifyProps = {
  children?: React.ReactNode;
  linkClassName?: string;
};

const MemoLinkify = React.memo((props: MemoLinkifyProps) => {
  return (
    <Linkify
      componentDecorator={(href, text, key) => (
        <a
          key={key}
          href={href}
          className={props.linkClassName}
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          {text}
        </a>
      )}
    >
      {props.children}
    </Linkify>
  );
});

export default MemoLinkify;
