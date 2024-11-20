import CustomNav from "@/components/nav/CustomNav";
import getActiveOrg from "@/utils/getActiveOrg.mjs";

const expensesLayout = async ({ children }) => {
  const orgId = await getActiveOrg();
  return (
    <>
      <CustomNav expenses={true} orgId={orgId} />
      {children}
    </>
  );
};

export default expensesLayout;
