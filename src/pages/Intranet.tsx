
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useLocale } from "@/i18n/locale";

const Intranet = () => {
  const { isZh, localize } = useLocale();

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 md:px-6">
      <div className="max-w-md space-y-4 text-center">
        <Lock className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {isZh ? "VPX 内部资源" : "VPX Intranet"}
        </h1>
        <p className="text-muted-foreground">
          {isZh
            ? "内部资源不在公开网站提供。VPX 成员如需访问，请联系自己的指导老师。"
            : "The intranet is not available on this public website. VPX members can contact their supervisor for access to internal resources."}
        </p>
        <Link to={localize("/")} className="inline-block text-primary underline underline-offset-4">
          {isZh ? "返回首页" : "Return to the homepage"}
        </Link>
      </div>
    </div>
  );
};

export default Intranet;
