import ImportCustomersPage from "@/components/pages/ImportCustomersPage";
import { websiteName } from "@/constants/constantsName.mjs";

const page = () => {
  return (
    <>
      <ImportCustomersPage />
    </>
  );
};

export default page;

export async function generateMetadata() {
  return {
    title: `Import Customers - ${websiteName}`,
    description:
      "Import customer data into Inventify to quickly onboard new clients and streamline your customer management process. Ensure your records are accurate and up-to-date with ease.",
  };
}
