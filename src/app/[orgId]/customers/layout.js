import CustomNav from "@/components/nav/CustomNav";

const layout = ({ children }) => {
  return (
    <>
      <CustomNav customer={true} />
      {children}
    </>
  );
};

export default layout;
