
import { useState } from "react";
import { Languages, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreloadLink as Link } from "@/components/preload-link";
import { useLocale } from "@/i18n/locale";

const navItems = [
  { name: "About", nameZh: "关于我们", path: "/about" },
  { name: "Projects", nameZh: "研究项目", path: "/projects" },
  { name: "Publications", nameZh: "论文发表", path: "/publications" },
  { name: "People", nameZh: "团队成员", path: "/people" },
  { name: "Updates", nameZh: "最新动态", path: "/activities" },
  { name: "Join Us", nameZh: "加入我们", path: "/join" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isZh, basePathname, localize, alternatePath } = useLocale();
  const showLanguageSwitch = basePathname !== "/studio/news";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to={localize("/")} className="flex items-center space-x-2">
            <img 
              src="/vpx-assets/c1c1ffb3-a447-43bc-b8cb-b2bba2dad10f.png" 
              alt={isZh ? "VPX Group 标志" : "VPX Group logo"}
              className="h-9 w-auto sm:h-10"
            />
          </Link>

          <nav className="hidden gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={localize(item.path)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  basePathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {isZh ? item.nameZh : item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {showLanguageSwitch ? (
            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 px-2.5">
              <Link
                to={alternatePath}
                aria-label={isZh ? "切换到英文" : "Switch to Chinese"}
                onClick={() => setIsOpen(false)}
              >
                <Languages className="h-4 w-4" aria-hidden="true" />
                <span lang={isZh ? "en" : "zh-CN"}>{isZh ? "EN" : "中文"}</span>
              </Link>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={
              isOpen
                ? isZh ? "关闭导航菜单" : "Close navigation menu"
                : isZh ? "打开导航菜单" : "Open navigation menu"
            }
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="container border-t bg-background/95 py-4 lg:hidden">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={localize(item.path)}
                className={`text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded-md ${
                  basePathname === item.path
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {isZh ? item.nameZh : item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
