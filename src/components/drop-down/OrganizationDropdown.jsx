'use client'
import AuthContext from "@/contexts/AuthContext.mjs";
import { useContext } from "react";
import Select from "react-select";

const OrganizationDropdown = () => {
    const { organizations, activeOrganization, setActiveOrganization } = useContext(AuthContext);
    const options = organizations?.map((org) => ({
        value: org.orgId,
        label: org.name,
    }));

    // Find the currently active organization in the options
    const defaultValue = options?.find(option => option?.value === activeOrganization?.orgId);

    const handleOrganizationChange = (selectedOption) => {
        setActiveOrganization(organizations.find(o => o?.orgId === selectedOption?.value));
    };

    return (
        <>
            {organizations?.length > 0 && <div className="w-fit items-center py-1 flex gap-4" >
                <p>Organizations: </p>
                <Select
                    value={defaultValue}
                    onChange={handleOrganizationChange}
                    options={options}
                    className="text-black dark:text-white"
                    classNamePrefix="react-select"
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary: '#00e76f',
                            primary25: '#d9eff1',
                            neutral0: '#424242',
                            neutral80: '#ffffff',
                        },
                    })}
                />
            </div>}
        </>
    );
};

export default OrganizationDropdown;
