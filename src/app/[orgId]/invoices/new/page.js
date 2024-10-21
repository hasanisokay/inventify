import getActiveOrg from "@/utils/getActiveOrg.mjs";
import dynamic from "next/dynamic";

// import NewInvoice from "@/components/forms/NewInvoice";
const NewInvoice = dynamic(() => import("@/components/forms/NewInvoice"), {
  ssr: false,
});
const page = async() => {
  const orgId = await getActiveOrg()
  return (
    <div>
      <NewInvoice activeOrg={orgId}/>
    </div>
  );
};

export default page;
