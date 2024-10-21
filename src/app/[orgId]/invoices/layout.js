import CustomNav from "@/components/nav/CustomNav";
import getActiveOrg from "@/utils/getActiveOrg.mjs";

const HomepageLayout = async({ children }) => {
  const orgId = await getActiveOrg()
  return <>
<CustomNav invoice={true} orgId={orgId}/>
  {children}
  </>;
};

export default HomepageLayout;
