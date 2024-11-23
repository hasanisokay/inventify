import ImportExpensesPage from "@/components/pages/ImportExpensesPage";
import { websiteName } from "@/constants/constantsName.mjs";

const page = () => {
  return (
    <>
<ImportExpensesPage />
    </>
  );
};

export default page;

export async function generateMetadata() {
  return {
    title: `Import Expenses - ${websiteName}`,
    description:
      "Import invoice data into Inventify to quickly onboard new clients and streamline your customer management process. Ensure your records are accurate and up-to-date with ease.",
  };
}
