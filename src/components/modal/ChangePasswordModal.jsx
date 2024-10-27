'use client';
import { useState } from "react";
import toast from "react-hot-toast";

const ChangePasswordModal = ({ openModal, setOpenModal }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        const formData = { newPassword, currentPassword }
        try {

            setLoading(true);

            const res = await fetch("/api/adds/change-pass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json();
            if (data.status === 200) {
                toast.success(data.message)
                setTimeout(() => {
                    setOpenModal(false);
                }, 1000);
            } else {
                toast.error(data.message);
            }
        } catch {

        } finally {
            setNewPassword("")
            setConfirmPassword("")
            setCurrentPassword("")
            setLoading(false)
        }


    };

    return (
        <div className="mx-auto flex w-72 items-center justify-center">
            <div
                onClick={() => setOpenModal(false)}
                className={`fixed z-[100] flex items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'} inset-0 h-full w-full bg-black/20 backdrop-blur-sm duration-100`}
            >
                <div
                    onClick={(e_) => e_.stopPropagation()}
                    className={`absolute w-fit min-w-[90%] md:min-w-[60%] max-h-[90%] overflow-y-auto rounded-lg bg-white dark:bg-gray-900 drop-shadow-2xl ${openModal ? 'opacity-1 translate-y-0 duration-300' : '-translate-y-20 opacity-0 duration-150'}`}
                >
                    <div className="px-5 pb-5 pt-3 lg:pb-10 lg:pt-5 lg:px-10">
                        <h1 className="text-xl font-bold">Change Password</h1>
                        {error && <p className="text-red-500">{error}</p>}
                        <form onSubmit={handleSubmit} className="mt-4">
                            <div className="input-container mb-4">
                                <label className="font-semibold mr-2 w-[150px]">Current Password:</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder=""
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="text-input pr-[50px]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-2 top-2 text-gray-500"
                                    >
                                        {showCurrentPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                            <div className="input-container mb-4">
                                <label className="font-semibold mr-2 w-[150px]">New Password:</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder=""
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="text-input pr-[50px]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-2 top-2 text-gray-500"
                                    >
                                        {showNewPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                            <div className="input-container mb-4">
                                <label className="font-semibold mr-2 w-[150px]">Confirm Password:</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder=""
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="text-input pr-[50px]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-2 top-2 text-gray-500"
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className={`mt-4 px-4 py-2 bg-blue-600 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
