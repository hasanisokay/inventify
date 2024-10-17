// import NewItem from '';

import Spinner from '@/components/loader/Spinner';
import dynamic from 'next/dynamic';

const NewItem = dynamic(() => import('@/components/forms/NewItem'), {
    loading: () => <Spinner />, ssr: false
  })
const page = () => {
    return (
        <div>
            <NewItem />
        </div>
    );
};

export default page;