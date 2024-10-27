import { websiteName } from "@/constants/constantsName.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import dynamic from "next/dynamic";

// import NewInvoice from "@/components/forms/NewInvoice";
const NewInvoice = dynamic(() => import("@/components/forms/NewInvoice"), {
  ssr: false,
});
const page = async({ searchParams }) => {
  const invoiceId = searchParams.id
  const orgId = await getActiveOrg()
  return (
    <div>
      <NewInvoice activeOrg={orgId} id={invoiceId}/>
    </div>
  );
};

export default page;

export async function generateMetadata() {
  return {
    title: `New Invoice - ${websiteName}`,
    description: "Create a new invoice in Inventify to bill your clients efficiently and manage your accounts receivable with ease.",
  };
}