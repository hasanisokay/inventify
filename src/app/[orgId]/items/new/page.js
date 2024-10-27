// import NewItem from '';

import Spinner from '@/components/loader/Spinner';
import { websiteName } from '@/constants/constantsName.mjs';
import dynamic from 'next/dynamic';

const NewItem = dynamic(() => import('@/components/forms/NewItem'), {
    loading: () => <Spinner />, ssr: false
  })
const page = ({searchParams}) => {
    const id = searchParams?.id || null;
    return (
        <div>
            <NewItem id={id}/>
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