
import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ScrollToTop } from "./scroll-to-top";
import { ThemeProvider } from "@/components/theme/theme-provider";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
