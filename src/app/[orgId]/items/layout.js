import ItemsNav from "@/components/nav/ItemsNav";

const ItemsLayout = ({ children }) => {
  return <>
  <ItemsNav />
  {children}
  </>
};

export default ItemsLayout;
