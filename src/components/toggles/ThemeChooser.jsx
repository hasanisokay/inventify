'use client'
import useTheme from "@/hooks/useTheme.mjs";

const ThemeChooser = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="py-4 w-fit ">
            <h3 className="mb-2 font-semibold">Choose Theme</h3>
            <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                    <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={theme === "light"}
                        onChange={toggleTheme}
                        className="mr-2"
                    />
                    Light
                </label>
                <label className="flex items-center">
                    <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={theme === "dark"}
                        onChange={toggleTheme}
                        className="mr-2"
                    />
                    Dark
                </label>
            </div>
        </div>
    );
};

export default ThemeChooser;
