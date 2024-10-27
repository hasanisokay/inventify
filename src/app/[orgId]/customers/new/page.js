import Spinner from "@/components/loader/Spinner";
import { websiteName } from "@/constants/constantsName.mjs";
import dynamic from "next/dynamic";

const NewCustomer = dynamic(()=>import("@/components/forms/NewCustomer"),{
    loading: () => <Spinner />, ssr: false
})
const page = ({ searchParams }) => {
    const customerId = searchParams.id
    return (
        <>
            <NewCustomer id={customerId ? customerId : null} />
        </>
    );
};

export default page;

export async function generateMetadata() {
    return {
      title: `Add New Customer - ${websiteName}`,
      description: "Add a new customer in Inventify to strengthen your business relationships. Capture essential details to improve engagement and streamline your customer management.",
    };
  }