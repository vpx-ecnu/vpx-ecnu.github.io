import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { VisitorMapWidget } from "./visitor-map-widget";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/60 bg-background py-8">
      <div className="container flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-xl flex-1 flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/vpx-assets/c1c1ffb3-a447-43bc-b8cb-b2bba2dad10f.png"
              alt="VPX Lab Logo"
              className="h-8 w-auto"
            />
          </Link>

          <p className="text-sm text-muted-foreground">
            Advancing visual perception for cross-disciplinary research.
          </p>

          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground lg:items-start lg:text-left">
            <a
              href="mailto:yli@cs.ecnu.edu.cn"
              className="flex flex-wrap items-center justify-center gap-2 transition-colors hover:text-foreground lg:justify-start"
            >
              <Mail className="h-4 w-4" />
              yli@cs.ecnu.edu.cn
            </a>

            <p className="max-w-sm break-words">
              3663 Zhongshan North Road, Shanghai 200062
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-1 lg:justify-start">
              <a
                href="https://space.bilibili.com/487404760"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Bilibili
              </a>
              <a
                href="https://github.com/vpx-ecnu"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <VisitorMapWidget />
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        © {year} VPX Group. All rights reserved.
      </div>
    </footer>
  );
}
