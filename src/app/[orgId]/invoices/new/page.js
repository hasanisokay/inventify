import dynamic from "next/dynamic";

// import NewInvoice from "@/components/forms/NewInvoice";
const NewInvoice = dynamic(() => import("@/components/forms/NewInvoice"), {
  ssr: false,
});
const page = () => {
  return (
    <div>
      <NewInvoice />
    </div>
  );
};

export default page;
