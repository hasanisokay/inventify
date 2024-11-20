import NotFound from "@/components/not-found/NotFound";
import ExpensesPage from "@/components/pages/ExpensesPage";
import PaginationDefault from "@/components/pagination/PaginationDefault";
import BarInExpenses from "@/components/selects/BarInExpenses";
import { websiteName } from "@/constants/constantsName.mjs";
import generateUniqueIds from "@/utils/generateUniqueIds.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import getExpenses from "@/utils/getExpenses.mjs";

const expensesPage = async ({ searchParams }) => {
  const page = parseInt(searchParams?.page) || 1;
  const limit = parseInt(searchParams?.limit) || 100;
  const sort = searchParams?.sort || "newest";
  const keyword = searchParams?.keyword || "";
  const orgId = await getActiveOrg();
  let expenses;
  try {
    expenses = await getExpenses(page, limit, sort, keyword, orgId);
  } catch (error) {
    expenses = null;
  }

  if (
    expenses?.status === 500 ||
    expenses?.status === 400 ||
    expenses?.status === 404 ||
    !expenses ||
    expenses?.error
  )
    return <NotFound />;
  let totalCount = expenses?.totalCount;
  const totalPages = Math.ceil(totalCount / limit);
  return (
    <div className="page-container">
      <BarInExpenses limit={limit} page={page} sort={sort}selectId ={generateUniqueIds(2)} />
      <ExpensesPage e={expenses.expenses} />
      {totalCount > limit && (
        <PaginationDefault p={page} totalPages={totalPages} />
      )}
    </div>
  );
};

export default expensesPage;


export async function generateMetadata() {
  return {
    title: `Expenses - ${websiteName}`,
    description: "Manage and view your invoices in Inventify to keep track of your financials.",
  };
}