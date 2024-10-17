import CustomersNav from "@/components/nav/CustomersNav";

const layout = ({children}) => {
    return <>
    <CustomersNav />
    {children}
    </>
};

export default layout;