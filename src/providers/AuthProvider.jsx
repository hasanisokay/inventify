'use client'
import AuthContext from "@/contexts/AuthContext.mjs";
import { verifyToken } from "@/utils/verifyToken.mjs";
import { useEffect, useState } from "react";


const AuthProvider = ({ children }) => {

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const userData = await verifyToken();
            if (userData) setCurrentUser(userData);
        }
        getUser()
    }, [])

    const authValues = {
        currentUser, setCurrentUser
    }
    return (
        <AuthContext.Provider value={authValues}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;