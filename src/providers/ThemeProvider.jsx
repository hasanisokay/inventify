'use client'
import ThemeContext from "@/contexts/ThemeContext.mjs";
import setThemeCookie from "@/utils/setThemeCookie.mjs";
import { useEffect, useState } from "react";

const ThemeProvider = ({ children, initialTheme }) => {
    const [theme, setTheme] = useState(initialTheme || "light");

    useEffect(() => {
        setThemeCookie(theme)
        document.querySelector("html").setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        const onChange = (e) => {
            const colorScheme = e.matches ? "dark" : "light";
            setTheme(colorScheme);
            setThemeCookie(colorScheme);
        };

        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", onChange);

        return () => {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", onChange);
        };
    }, []);




    const toggleTheme = () => {
        setTheme((preTheme) => {
            const currentTheme = preTheme === "dark" ? "light" : "dark";
            return currentTheme;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;