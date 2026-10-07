
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PreloadLink as Link } from "@/components/preload-link";
import { useLocale } from "@/i18n/locale";

const NotFound = () => {
  const location = useLocation();
  const { isZh, localize } = useLocale();

  useEffect(() => {
    document.documentElement.lang = isZh ? "zh-CN" : "en";
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [isZh, location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl md:text-8xl font-bold text-primary">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold">
          {isZh ? "页面不存在" : "Page Not Found"}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {isZh
            ? "你访问的页面可能已被移除、地址发生变化，或暂时无法访问。"
            : "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
        </p>
        <Button asChild size="lg">
          <Link to={localize("/")}>{isZh ? "返回首页" : "Return to Homepage"}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
