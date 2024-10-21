import NotFound from "@/components/not-found/NotFound";
import CustomersPage from "@/components/pages/CustomersPage";
import PaginationDefault from "@/components/pagination/PaginationDefault";
import getActiveOrg from "@/utils/getActiveOrg.mjs";

import getCustomers from "@/utils/getCustomers.mjs";
import dynamic from "next/dynamic";
const SortAndLimitBar = dynamic(
  () => import("@/components/selects/SortAndLimitBar"),
  { ssr: false }
);
const page = async ({ searchParams }) => {
  const page = parseInt(searchParams?.page) || 1;
  const limit = parseInt(searchParams?.limit) || 10;
  const sort = searchParams?.sort || "newest";
  const keyword = searchParams?.keyword || "";
  const orgId = await getActiveOrg();

  let customers;
  try {
    customers = await getCustomers(page, limit, sort, keyword, orgId);
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
      <SortAndLimitBar limit={limit} page={page} sort={sort} />
      <CustomersPage customers={customers?.customers} />
      {totalCount > limit && (
        <PaginationDefault p={page} totalPages={totalPages} />
      )}
    </div>
  );
};

export default page;
