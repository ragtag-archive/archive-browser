type SidebarProps = {
  isOpen: boolean;
};

const Sidebar = (props: SidebarProps) => {
  const { isOpen } = props;

  return (
    <div
      className={[
        "fixed z-40",
        "left-0 top-0 bottom-0",
        "pt-16 md:w-64 w-full bg-gray-900",
        "transition-all duration-200",
        isOpen ? "left-0" : "md:-left-64 -left-full",
      ].join(" ")}
    >
      hi
    </div>
  );
};

export default Sidebar;
