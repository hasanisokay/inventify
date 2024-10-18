import CustomNav from "@/components/nav/CustomNav";

const HomepageLayout = ({ children }) => {
  return <>
<CustomNav invoice={true}/>
  {children}
  </>;
};

export default HomepageLayout;
