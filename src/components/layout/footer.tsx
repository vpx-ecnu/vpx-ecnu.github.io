import { Mail } from "lucide-react";
import { PreloadLink as Link } from "@/components/preload-link";
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
              alt="VPX Group logo"
              className="h-8 w-auto"
            />
          </Link>

          <p className="text-sm text-muted-foreground">
            Advancing original, rigorous, human-centered AGI research across temporal, spatial, generative, and physical AI.
          </p>

          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground lg:items-start lg:text-left">
            <a
              href="mailto:yli@cs.ecnu.edu.cn"
              className="flex flex-wrap items-center justify-center gap-2 transition-colors hover:text-foreground lg:justify-start"
            >
              <Mail className="h-4 w-4" />
              General enquiries: yli@cs.ecnu.edu.cn
            </a>

            <Link to="/join" className="transition-colors hover:text-foreground">
              Prospective members: Join VPX
            </Link>

            <p className="max-w-sm break-words">
              School of International Chinese Studies, East China Normal University, No. 3663 North Zhongshan Road, Putuo District, Shanghai 200062, China
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

        <div className="shrink-0" aria-label="Visitor map">
          <VisitorMapWidget />
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        © {year} VPX Group. All rights reserved.
      </div>
    </footer>
  );
}
