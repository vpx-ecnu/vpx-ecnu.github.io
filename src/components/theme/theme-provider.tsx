// theme-provider.tsx 修改后的核心逻辑
import { Sun, Moon } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
};

const initialState: ThemeProviderState = {
  theme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// 时间判断逻辑（6:00-18:00 为白天）
const getThemeByTime = (): Theme => {
  const hours = new Date().getHours();
  return hours >= 6 && hours < 18 ? "light" : "dark";
};

// 添加时间监听
const setupTimeListener = (callback: () => void) => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  
  const timeUntilMidnight = midnight.getTime() - now.getTime();
  
  const timer = setTimeout(() => {
    callback();
    // 每天午夜重置定时器
    setupTimeListener(callback);
  }, timeUntilMidnight);

  return () => clearTimeout(timer);
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getThemeByTime());

  useEffect(() => {
    // 每分钟检查一次时间变化
    const interval = setInterval(() => {
      setTheme(getThemeByTime());
    }, 60_000);

    // 每天午夜准时更新
    const clearTimer = setupTimeListener(() => {
      setTheme(getThemeByTime());
    });

    return () => {
      clearInterval(interval);
      clearTimer();
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

// 修改后的主题指示组件（仅显示当前状态）
export function ThemeIndicator() {
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 p-2 rounded-full bg-background text-foreground">
      {theme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </div>
  );
}