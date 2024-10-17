import UserLogin from "@/components/forms/UserLogin";
import { websiteName } from "@/constants/constantsName.mjs";

const page = () => {
  return (
    <>
      <UserLogin />
    </>
  );
};

export default page;

export const metadata = {
  title: `Login - ${websiteName}`,
  description: "Created By Hasan",
};
