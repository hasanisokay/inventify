import CustomNav from "@/components/nav/CustomNav";

const ItemsLayout = ({ children }) => {
  return (
    <>
      <CustomNav items={true} />
      {children}
    </>
  );
};

export default ItemsLayout;
