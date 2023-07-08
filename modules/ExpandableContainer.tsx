import React from 'react';

type Props = {
  children: React.ReactNode;
};

const ExpandableContainer = (props: Props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showButton, setShowButton] = React.useState(false);
  const childContainer = React.useRef<HTMLDivElement>(null);
  const parentContainer = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!childContainer.current || !parentContainer.current) return;
    if (
      childContainer.current.clientHeight > parentContainer.current.clientHeight
    )
      setShowButton(true);
  }, [parentContainer, childContainer]);

  return (
    <div>
      <div
        ref={parentContainer}
        className={['overflow-hidden', isOpen ? 'h-auto' : 'max-h-12'].join(
          ' '
        )}
      >
        <div ref={childContainer}>{props.children}</div>
      </div>
      {showButton && (
        <button
          type="button"
          className="font-bold hover:underline cursor-pointer text-blue-500"
          onClick={() => setIsOpen((now) => !now)}
        >
          {isOpen ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

export default ExpandableContainer;
