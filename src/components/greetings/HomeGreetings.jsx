'use client'
import AuthContext from "@/contexts/AuthContext.mjs";
import logOut from "@/utils/logOut.mjs";
import { useContext } from "react";

const HomeGreetings = () => {
    const { currentUser } = useContext(AuthContext);
    return (
        <>
            {currentUser && <div>
                <h2 className="text-center text-xl">Welcome, {currentUser?.fullName}</h2>
                <button onClick={async () => {
                    await logOut()
                    window.location.reload()
                }}>Log Out</button>
            </div>
            }
        </>);
};

export default HomeGreetings;