import NotFound from "@/components/not-found/NotFound";
import CustomersPage from "@/components/pages/CustomersPage";
import PaginationDefault from "@/components/pagination/PaginationDefault";
import LimitSelect from "@/components/selects/LimitSelect";
import { websiteName } from "@/constants/constantsName.mjs";
import generateUniqueIds from "@/utils/generateUniqueIds.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";

import getCustomers from "@/utils/getCustomers.mjs";
const page = async ({ searchParams }) => {
  const page = parseInt(searchParams?.page) || 1;
  const limit = parseInt(searchParams?.limit) || 100;
  const sort = searchParams?.sort || "spenders";
  const keyword = searchParams?.keyword || "";
  const orgId = await getActiveOrg();
  let customers;
  try {
    customers = await getCustomers(page, limit, sort, keyword,"", orgId);
  } catch (error) {
    customers = null;
  }

  if (
    customers?.status === 500 ||
    customers?.status === 400 ||
    customers?.status === 404 ||
    !customers ||
    customers?.error
  )
    return <NotFound />;
  let totalCount = customers?.totalCount;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="page-container">
       <LimitSelect limit={limit} page={page} sort={sort} selectId ={generateUniqueIds(2)} />
      <CustomersPage c={customers?.customers} totalCount={totalCount} totalPages={totalPages} limit={limit} page={page} sort={sort} />
      {totalCount > limit && (
        <PaginationDefault p={page} totalPages={totalPages} limit={limit} />
      )}
    </div>
  );
};

export default page;

export async function generateMetadata() {
  return {
    title: `Customers - ${websiteName}`,
    description:"Manage your customer relationships in Inventify. View, add, and edit customer details to enhance your business interactions and track engagement.",
  };
}