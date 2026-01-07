import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/60 bg-background py-8">
      <div className="container flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        {/* Left: Logo + Slogan */}
        <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left max-w-md">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/lovable-uploads/c1c1ffb3-a447-43bc-b8cb-b2bba2dad10f.png"
              alt="VPX Lab Logo"
              className="h-8 w-auto"
            />
          </Link>

          <p className="text-sm text-muted-foreground whitespace-nowrap">
            Advancing cross-disciplinary research through artificial intelligence and collaborative innovation.
          </p>
        </div>

        {/* Right: Contact & Social */}
        <div className="flex flex-col items-center md:items-end gap-2 text-sm text-muted-foreground text-center md:text-right">
          <a
            href="mailto:yli@cs.ecnu.edu.cn"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Mail className="h-4 w-4" />
            yli@cs.ecnu.edu.cn
          </a>

          <p>3663 Zhongshan North Road, Shanghai 200062</p>

          <div className="flex gap-4 pt-1">
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

      {/* Bottom */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        © {year} VPX Group. All rights reserved.
      </div>
    </footer>
  );
}
