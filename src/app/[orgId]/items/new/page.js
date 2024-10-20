// import NewItem from '';

import Spinner from '@/components/loader/Spinner';
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