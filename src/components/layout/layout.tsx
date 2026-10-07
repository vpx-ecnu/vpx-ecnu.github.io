
import { ReactNode, useEffect } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ScrollToTop } from "./scroll-to-top";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { useLocale } from "@/i18n/locale";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isZh } = useLocale();

  useEffect(() => {
    document.documentElement.lang = isZh ? "zh-CN" : "en";
    document.title = isZh
      ? "VPX Group｜华东师范大学"
      : "VPX Group | Visual Perception + X at ECNU";
  }, [isZh]);

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
