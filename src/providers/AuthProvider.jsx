'use client'
import AuthContext from "@/contexts/AuthContext.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import setActiveOrg from "@/utils/setActiveOrg.mjs";
import { verifyToken } from "@/utils/verifyToken.mjs";
import { useEffect, useState } from "react";

const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [organizations, setOrganizations] = useState(null);
    const [activeOrganization, setActiveOrganization] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const userData = await verifyToken();
            if (userData) {
                if (!currentUser) {
                    setCurrentUser(userData)
                }
                const res = await fetch(`/api/gets/organizations?username=${userData?.username}`, { credentials: 'include' });
                const data = await res.json();
                setOrganizations(data?.data || [])
                const actOrgFromCookies = await getActiveOrg()

                if (!actOrgFromCookies && data?.data?.length > 0) {
                    setActiveOrganization(data?.data[0]);
                }
                else {
                    setActiveOrganization(data?.data?.find(o => o?.orgId === actOrgFromCookies))
                }
            };
        }
        getUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser])


    useEffect(() => {
        if (activeOrganization) {
            setActiveOrg(activeOrganization?.orgId)
        }
    }, [activeOrganization]);

    const authValues = {
        currentUser, setCurrentUser, organizations, activeOrganization, setActiveOrganization
    }
    return (
        <AuthContext.Provider value={authValues}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;