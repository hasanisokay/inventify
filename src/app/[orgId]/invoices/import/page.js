import ImportInvoicePage from "@/components/pages/ImportInvoicePage";
import { websiteName } from "@/constants/constantsName.mjs";

const page = () => {
  return (
    <>
<ImportInvoicePage />
    </>
  );
};

export default page;

export async function generateMetadata() {
  return {
    title: `Import Invoices - ${websiteName}`,
    description:
      "Import invoice data into Inventify to quickly onboard new clients and streamline your customer management process. Ensure your records are accurate and up-to-date with ease.",
  };
}
