import Analytics from "@/components/analytics/Analytics";
import CostSummary from "@/components/analytics/costs/CostSummary";
import { websiteName } from "@/constants/constantsName.mjs";
import capitalize from "@/utils/capitalize.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";

const page = async() => {
  return (
    <div className="pt-10">
      <CostSummary />
      <Analytics />
    </div>
  );
};

export default page;



export async function generateMetadata() {
  const activeOrg = await getActiveOrg()
  return {
    title: `${websiteName} - ${capitalize(activeOrg)}`,
    description: "Access your Inventify analytics to gain insights and optimize your business operations.",
  };
}


