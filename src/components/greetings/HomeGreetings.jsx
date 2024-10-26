'use client'
import AuthContext from "@/contexts/AuthContext.mjs";
import { useContext } from "react";

const HomeGreetings = () => {
    const { currentUser } = useContext(AuthContext);
    return (
        <>
            {currentUser && <div>
                <h2 className="text-center text-2xl">Greetings, {currentUser?.fullName}</h2>
            </div>
            }
        </>);
};

export default HomeGreetings;