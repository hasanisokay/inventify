import Analytics from "@/components/analytics/Analytics";
import OrganizationDropdown from "@/components/drop-down/OrganizationDropdown";
import HomeGreetings from "@/components/greetings/HomeGreetings";
import getActiveOrg from "@/utils/getActiveOrg.mjs";

export default async function Home() {
  const actOrg = await getActiveOrg()
  return (
    <div className="pt-20 md:px-10 px-2">
      <HomeGreetings />
      <OrganizationDropdown />

      <Analytics actOrg={actOrg}/>
    </div>
  );
}
