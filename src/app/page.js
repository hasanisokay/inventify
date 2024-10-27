import OrganizationDropdown from "@/components/drop-down/OrganizationDropdown";
import HomeGreetings from "@/components/greetings/HomeGreetings";
import ThemeChooser from "@/components/toggles/ThemeChooser";


export default function Home() {
  return (
    <div className="pt-20 md:px-10 px-2">
      <HomeGreetings />
      <ThemeChooser />
      <OrganizationDropdown />
    </div>
  );
}
