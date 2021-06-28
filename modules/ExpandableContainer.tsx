import React from "react";

type Props = {
  children: React.ReactNode;
};

const ExpandableContainer = (props: Props) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <div
        className={["overflow-hidden", isOpen ? "h-auto" : "h-16"].join(" ")}
      >
        {props.children}
      </div>
      <div
        className="font-bold hover:underline cursor-pointer"
        onClick={() => setIsOpen((now) => !now)}
      >
        {isOpen ? "Show less" : "Show more"}
      </div>
    </div>
  );
};

export default ExpandableContainer;
