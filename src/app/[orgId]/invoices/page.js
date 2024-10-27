import NotFound from "@/components/not-found/NotFound";
import InvoicePage from "@/components/pages/InvoicePage";
import PaginationDefault from "@/components/pagination/PaginationDefault";
import BarInInvoices from "@/components/selects/BarInInvoices";
import BarInItems from "@/components/selects/BarInItems";
import { websiteName } from "@/constants/constantsName.mjs";
import generateUniqueIds from "@/utils/generateUniqueIds.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import getInvoices from "@/utils/getInvoices.mjs";

const page = async ({ searchParams }) => {
  const page = parseInt(searchParams?.page) || 1;
  const limit = parseInt(searchParams?.limit) || 100;
  const sort = searchParams?.sort || "newest";
  const keyword = searchParams?.keyword || "";
  const orgId = await getActiveOrg();
  let invoices;
  try {
    invoices = await getInvoices(page, limit, sort, keyword,"", orgId);
  } catch (error) {
    invoices = null;
  }

  if (
    invoices?.status === 500 ||
    invoices?.status === 400 ||
    invoices?.status === 404 ||
    !invoices ||
    invoices?.error
  )
    return <NotFound />;
  let totalCount = invoices?.totalCount;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="page-container">
      <BarInInvoices limit={limit} page={page} sort={sort}selectId ={generateUniqueIds(2)} />
      <InvoicePage invoices={invoices?.invoices} />
      {totalCount > limit && (
        <PaginationDefault p={page} totalPages={totalPages} />
      )}
    </div>
  );
};

export default page;


export async function generateMetadata() {
  return {
    title: `Invoices - ${websiteName}`,
    description: "Manage and view your invoices in Inventify to keep track of your financials.",
  };
}