'use client'
import AuthProvider from "./AuthProvider";
import ThemeProvider from "./ThemeProvider";

const Providers = ({ children, initialTheme }) => {
    return (
        <ThemeProvider initialTheme={initialTheme}>
            <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
    );
};

export default Providers;