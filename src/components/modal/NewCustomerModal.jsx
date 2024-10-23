'use client'
import NewCustomer from "../forms/NewCustomer";

const NewCustomerModal = ({ openModal, setOpenModal, onSaveCustomer }) => {

  return (
    <div className="mx-auto flex items-center justify-center">
      <div onClick={() => setOpenModal(false)} className={`fixed z-[100] flex items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'} inset-0 h-full w-full bg-black/20 backdrop-blur-sm duration-100`}>
        <div onClick={(e_) => e_.stopPropagation()} className={`absolute md:w-[90%] w-full h-[80%] overflow-y-scroll  rounded-lg bg-white dark:bg-gray-900 drop-shadow-2xl ${openModal ? 'opacity-1 translate-y-0 duration-300' : '-translate-y-20 opacity-0 duration-150'}`}>
          <NewCustomer onSaveCustomer={onSaveCustomer} setOpenModal={setOpenModal} />
        </div>
      </div>
    </div>
  )
}
export default NewCustomerModal;