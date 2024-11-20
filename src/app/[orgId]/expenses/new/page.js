import NewExpense from "@/components/forms/NewExpense";
import { websiteName } from "@/constants/constantsName.mjs";
import generateUniqueIds from "@/utils/generateUniqueIds.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import dynamic from "next/dynamic";

// import NewInvoice from "@/components/forms/NewInvoice";
// const NewInvoice = dynamic(() => import("@/components/forms/NewInvoice"), {
//   ssr: false,
// });
const page = async({ searchParams }) => {
  const expenseId = searchParams.id;
  const uniqueIds = generateUniqueIds(4)
  const orgId = await getActiveOrg();
  return (
    <div>
      <NewExpense activeOrg={orgId} id={expenseId} uniqueIds={uniqueIds}/>
    </div>
  );
};

export default page;

export async function generateMetadata() {
  return {
    title: `New Expense - ${websiteName}`,
    description: "Create a new invoice in Inventify to bill your clients efficiently and manage your accounts receivable with ease.",
  };
}