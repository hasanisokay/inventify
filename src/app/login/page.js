import UserLogin from "@/components/forms/UserLogin";
import { websiteName } from "@/constants/constantsName.mjs";
import { hostname } from "@/constants/hostname.mjs";
import {  loginMetaImage } from "@/constants/metaImages.mjs";

const page = async() => {
  return (
    <>
      <UserLogin />
    </>
  );
};

export default page;

export async function generateMetadata() {
  return {
    title: `Login - ${websiteName}`,
    description: "Access your Inventify account and manage your business efficiently.",
  };
}
