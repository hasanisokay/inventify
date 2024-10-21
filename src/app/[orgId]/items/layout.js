import CustomNav from "@/components/nav/CustomNav";
import getActiveOrg from "@/utils/getActiveOrg.mjs";

const ItemsLayout = async ({ children }) => {
  const orgId = await getActiveOrg();
  return (
    <>
      <CustomNav items={true} orgId={orgId} />
      {children}
    </>
  );
};

export default ItemsLayout;
