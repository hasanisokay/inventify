import ImportItemsPage from "@/components/pages/ImportItemsPage";
import { websiteName } from "@/constants/constantsName.mjs";


const page = () => {
  return (
    <>
     <ImportItemsPage /> 
    </>
  );
};

export default page;



export async function generateMetadata() {
  return {
    title: ` Import Items - ${websiteName}`,
    description: "Import your items into Inventify to streamline your inventory management and enhance business operations.",
  };
}