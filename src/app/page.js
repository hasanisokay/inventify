import Analytics from "@/components/analytics/Analytics";
import CostSummary from "@/components/analytics/costs/CostSummary";
import OrganizationDropdown from "@/components/drop-down/OrganizationDropdown";
import HomeGreetings from "@/components/greetings/HomeGreetings";
import ThemeChooser from "@/components/toggles/ThemeChooser";


export default function Home() {
  return (
    <div className="pt-20">
      <HomeGreetings />
      <ThemeChooser />
      <OrganizationDropdown />
      <CostSummary />
      <Analytics />
    </div>
  );
}
