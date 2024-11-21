import NotFound from "@/components/not-found/NotFound";
import ItemsPage from "@/components/pages/ItemsPage";
import PaginationDefault from "@/components/pagination/PaginationDefault";
import BarInItems from "@/components/selects/BarInItems";
import { websiteName } from "@/constants/constantsName.mjs";
import generateUniqueIds from "@/utils/generateUniqueIds.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import getItems from "@/utils/getItems.mjs";

const page = async ({ searchParams }) => {
  const page = parseInt(searchParams?.page) || 1;
  const limit = parseInt(searchParams?.limit) || 100;
  const sort = searchParams?.sort || "highest";
  
  const now = new Date(); 
  const endDate = searchParams?.endDate || now.toISOString(); 
  const startDate = searchParams?.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(); 

  const keyword = searchParams?.keyword || "";
  const orgId = await getActiveOrg();
  let items;
  try {
    items = await getItems(page, limit, sort, keyword,"", orgId, startDate, endDate);
  } catch (error) {
    items = null;
  }

  if (
    items?.status === 500 ||
    items?.status === 400 ||
    items?.status === 404 ||
    !items ||
    items?.error
  )
    return <NotFound />;
  let totalCount = items?.totalCount;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="page-container">
      <BarInItems limit={limit} page={page} sort={sort}selectId ={generateUniqueIds(2)} />
      <ItemsPage i={items?.items} actOrg={orgId} keyword={keyword} />
      {totalCount > limit && (
        <PaginationDefault p={page} totalPages={totalPages} />
      )}
    </div>
  );
};

export default page;

export async function generateMetadata() {
  return {
    title: `Items - ${websiteName}`,
    description: "Explore your items in Inventify to manage inventory and track performance.",
  };
}