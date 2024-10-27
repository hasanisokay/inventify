'use client';
import AuthContext from '@/contexts/AuthContext.mjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useState } from 'react';
import toast from 'react-hot-toast';

const UserLogin = () => {
    const { setCurrentUser } = useContext(AuthContext);
    const searchParams = useSearchParams();
    const router = useRouter();
    const redirectTo = searchParams.get('redirectTo');

    // State variables for username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error("Please fill in both fields.");
            return;
        }

        const formData = {
            username: username,
            password: password
        }
        const res = await fetch(`/api/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!data) {
            toast.error("Try again.");
        } else if (data.status === 200) {
            setCurrentUser(data.user);
            toast.success(data.message);
            router.push(redirectTo || "/");
        } else {
            toast.error(data.message);
        }
    };

    return (
        <div className="mt-10 mx-auto w-full max-w-md space-y-4 rounded-lg border bg-white p-7 shadow-lg sm:p-10 dark:border-zinc-700 dark:bg-zinc-900">
            <h1 className="text-3xl font-semibold tracking-tight">Sign In</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-sm">
                    <label htmlFor="username" className="block text-zinc-700 dark:text-zinc-300 font-medium">
                        Username
                    </label>
                    <input
                        className="flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus-visible:outline-none dark:border-zinc-700"
                        id="username"
                        placeholder="Enter username"
                        name="username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // Update state on change
                    />
                </div>
                <div className="space-y-2 text-sm">
                    <label htmlFor="password" className="block text-zinc-700 dark:text-zinc-300 font-medium">
                        Password
                    </label>
                    <input
                        className="flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus-visible:outline-none dark:border-zinc-700"
                        id="password"
                        placeholder="Enter password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Update state on change
                    />
                </div>
                <button className="rounded-md bg-sky-500 px-4 py-1 text-white transition-colors hover:bg-sky-600 dark:bg-sky-700">Submit</button>
            </form>
            <p className="text-center text-sm text-zinc-700 dark:text-zinc-300">
                Please contact support at <a href="mailto:inventifyme@gmail.com" className="text-blue-500 hover:underline">inventifyme@gmail.com</a> if you want to create an account.
            </p>
        </div>
    );
};

export default UserLogin;
