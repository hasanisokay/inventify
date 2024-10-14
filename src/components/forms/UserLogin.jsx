'use client'
import AuthContext from '@/contexts/AuthContext.mjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext } from 'react';
import toast from 'react-hot-toast';

const UserLogin = () => {
    const {setCurrentUser} = useContext(AuthContext);
    const searchParams = useSearchParams();
    const router = useRouter()
    const redirectTo = searchParams.get('redirectTo');
    return (
        <div className="mt-10 mx-auto w-full max-w-md space-y-4 rounded-lg border bg-white p-7 shadow-lg sm:p-10 dark:border-zinc-700 dark:bg-zinc-900">
            <h1 className="text-3xl font-semibold tracking-tight">Sign In</h1>

            <form action={async (formData) => {
                  const username = formData.get("username");
                  const password = formData.get("password");
                  if (!username?.trim() || !password?.trim()) {
                    return null;
                  }
                  const res = await fetch(`/api/login`,{
                    method:"POST",
                    credentials: 'include',
                    headers: {
                     'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({username,password})
                   });
                   const data = await res.json();

                // const result = await userLogin(FormData);
                if (!data) toast.error("Try again.");
                else if (data.error) toast.error(result.message);
                else {
                    setCurrentUser(data.user)
                    toast.success(data.message);
                    router.push(redirectTo || "/")
                }
            }} className="space-y-6">
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
                    />
                    <div className="flex justify-end text-xs">
                        <a href="#" className="text-zinc-700 hover:underline dark:text-zinc-300">
                            Forgot Password?
                        </a>
                    </div>
                </div>
                <button className="rounded-md bg-sky-500 px-4 py-2 text-white transition-colors hover:bg-sky-600 dark:bg-sky-700">Submit</button>
            </form>
            <p className="text-center text-sm text-zinc-700 dark:text-zinc-300">
                Don&apos;t have an account?
                <a href="#" className="font-semibold underline">
                    Signup
                </a>
            </p>
        </div>
    );
};

export default UserLogin;