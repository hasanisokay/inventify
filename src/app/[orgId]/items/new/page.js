// import NewItem from '';

import Spinner from '@/components/loader/Spinner';
import { websiteName } from '@/constants/constantsName.mjs';
import getActiveOrg from '@/utils/getActiveOrg.mjs';
import dynamic from 'next/dynamic';

const NewItem = dynamic(() => import('@/components/forms/NewItem'), {
    loading: () => <Spinner />, ssr: false
  })
const page = async({searchParams}) => {
    const id = searchParams?.id || null;
    const activeOrg = await getActiveOrg();
    return (
        <div>
            <NewItem id={id} actOrg={activeOrg}/>
        </div>
    );
};

export default page;


export async function generateMetadata() {
    return {
      title: `Add New Item - ${websiteName}`,
      description: "Create and manage new items in Inventify to enhance your inventory.",
    };
  }