'use client'
import AuthContext from "@/contexts/AuthContext.mjs";
import { useContext } from "react";

const HomeGreetings = () => {
    const { currentUser } = useContext(AuthContext);
    return (
        <>
            {currentUser && <div>
                <h2 className="text-center text-xl">Welcome, {currentUser?.fullName}</h2>
             
            </div>
            }
        </>);
};

export default HomeGreetings;