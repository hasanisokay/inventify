'use client'
import AuthContext from "@/contexts/AuthContext.mjs";
import { useContext, useEffect, useState } from "react";
import Select from "react-select";
import NewOrgModal from "../modal/NewOrgModal";
import setActiveOrg from "@/utils/setActiveOrg.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import ChangePasswordModal from "../modal/ChangePasswordModal";

const OrganizationDropdown = () => {
    const [openChangePassModal, setOpenChangePassModal] = useState(false);
    const [openNewOrgModal, setOpenNewOrgModal] = useState(false);
    const [activeOrg, setTheActiveOrg] = useState(null);
    useEffect(() => {
        const fetchActiveOrg = async () => {
            const org = await getActiveOrg();
            setTheActiveOrg(org);
        };

        fetchActiveOrg();
    }, []);
    const { organizations } = useContext(AuthContext);
    const options = organizations?.map((org) => ({
        value: org.orgId,
        label: org.name,
    }));

    // Find the currently active organization in the options
    const defaultValue = options?.find(option => option?.value === activeOrg);

    const handleOrganizationChange = async (selectedOption) => {
        await setActiveOrg(selectedOption.value);
        window.location.reload()
    };

    return (
        <>
            {organizations && organizations?.length > 0 && <>
                <div className="flex gap-10 flex-wrap items-center">
                    <div className="w-fit items-center py-1 flex gap-4" >
                        <p className="font-medium">Organizations: </p>
                        <Select
                            value={defaultValue}
                            onChange={handleOrganizationChange}
                            options={options}
                            className="text-black"
                            classNamePrefix="react-select"
                        // theme={(theme) => ({
                        //     ...theme,
                        //     colors: {
                        //         ...theme.colors,
                        //         primary: '#00e76f',
                        //         primary25: '#d9eff1',
                        //         neutral0: '#424242',
                        //         neutral80: '#ffffff',
                        //     },
                        // })}
                        />
                    </div>
                    <div>
                        <button onClick={() => setOpenNewOrgModal(true)} className="py-2 font-semibold">Add New Org</button>
                    </div>
                    {/* <div>
                        {
                            activeOrg && <Link className="py-2 font-semibold" href={`/${activeOrg}`}>See Analytics</Link>
                        }
                    </div> */}
                    <div>
                        <button onClick={() => setOpenChangePassModal(true)} className="py-2 font-semibold">Change Password</button>
                    </div>
                </div>

                <NewOrgModal
                    setOpenModal={setOpenNewOrgModal}
                    openModal={openNewOrgModal}

                />

                <ChangePasswordModal
                    setOpenModal={setOpenChangePassModal}
                    openModal={openChangePassModal}
                />
            </>}


        </>
    );
};

export default OrganizationDropdown;
