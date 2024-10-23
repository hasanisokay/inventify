import NewItem from "../forms/NewItem";

const NewItemModal = ({openModal, setOpenModal, onAddItem}) => {
    return (
      <div className="mx-auto flex w-72 items-center justify-center">
        <div onClick={() => setOpenModal(false)} className={`fixed z-[100] flex  items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'} inset-0 h-full w-full bg-black/20 backdrop-blur-sm duration-100`}>
          <div onClick={(e_) => e_.stopPropagation()} className={`absolute w-[90%] h-[90%] overflow-y-scroll bg-gray-300 rounded-lg dark:bg-gray-900 drop-shadow-2xl sm:w-[500px] ${openModal ? 'opacity-1 translate-y-0 duration-300' : '-translate-y-20 opacity-0 duration-150'}`}>
          <NewItem setOpenModal={setOpenModal} onAddItem={onAddItem}/>
          </div>
        </div>
      </div>
    )
  }
  export default NewItemModal;