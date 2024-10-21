import CustomNav from "@/components/nav/CustomNav";
import getActiveOrg from "@/utils/getActiveOrg.mjs";

const layout = async({ children }) => {
  const orgId = await getActiveOrg()
  return (
    <>
      <CustomNav customer={true} orgId={orgId}/>
      {children}
    </>
  );
};

export default layout;
