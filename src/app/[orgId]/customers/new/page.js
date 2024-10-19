import Spinner from "@/components/loader/Spinner";
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