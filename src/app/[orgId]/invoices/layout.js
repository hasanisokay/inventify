import InvoiceNav from "@/components/nav/InvoiceNav";

const HomepageLayout = ({ children }) => {
  return <>
  <InvoiceNav />
  {children}
  </>;
};

export default HomepageLayout;
